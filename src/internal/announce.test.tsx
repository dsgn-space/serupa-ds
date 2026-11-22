import { describe, expect, test, vi } from 'vitest';
import { announce, ensureAnnouncer } from './announce';

const region = () => document.querySelector('[data-srp-announcer]') as HTMLElement;
const settle = () => new Promise((ok) => setTimeout(ok, 700));

describe('announce', () => {
  test('a burst is said as one message, joined as sentences: no doubled stop after a message that ends in one, ". " after one that doesn\'t; a repeat waiting in the queue isn\'t added twice', async () => {
    ensureAnnouncer();
    await settle();
    announce('First');
    announce('Picked up Apollo, position 1 of 3.');
    announce('Apollo, position 2 of 3.');
    announce('Apollo, position 2 of 3.');
    announce('Saved');
    await expect.poll(() => region().textContent, { timeout: 3000 }).toBe('First. Picked up Apollo, position 1 of 3. Apollo, position 2 of 3. Saved');
    expect(region().textContent).not.toMatch(/\.\./);
  });

  test('the same message twice is said twice: the second differs by an invisible no-break space, the third is plain again (VoiceOver skips an identical repeat)', async () => {
    ensureAnnouncer();
    await settle();
    const seen: string[] = [];
    const watch = new MutationObserver(() => { if (region().textContent) seen.push(region().textContent); });
    watch.observe(region(), { childList: true, characterData: true, subtree: true });
    for (let i = 0; i < 3; i++) { announce('Copied'); await settle(); }
    watch.disconnect();
    expect(seen).toEqual(['Copied', 'Copied\u00a0', 'Copied']);
  });

  test('a clock that goes back (a system time change, a fake clock in a test) doesn\'t hold the next message back', async () => {
    ensureAnnouncer();
    await settle();
    vi.useFakeTimers({ toFake: ['Date'], now: Date.now() + 60000 });
    try {
      announce('Ahead');
      await expect.poll(() => region().textContent, { timeout: 3000 }).toBe('Ahead');
    } finally {
      vi.useRealTimers();
    }
    announce('Back');
    await expect.poll(() => region().textContent, { timeout: 1500 }).toBe('Back');
  });
});
