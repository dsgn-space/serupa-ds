import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { cdp, server } from 'vitest/browser';
import { keepMotion } from '../../tools/test/vitest/helpers';
import { withViewTransition } from './viewTransition';

type Go = { flip?: () => Promise<void>; seen?: string[]; groups?: Promise<Animation[]> };

function List({ go }: { go: Go }) {
  const [order, setOrder] = React.useState(['a', 'b', 'c']);
  go.flip = () => withViewTransition(() => setOrder((o) => [...o].reverse()));
  return <ul id="vt">{order.map((k) => <li key={k} id={k} className="view-transition-match" style={{ height: 20 }}>{k}</li>)}</ul>;
}

describe('withViewTransition', () => {
  keepMotion();

  test('runs the update as a View Transition: React state inside it is in the DOM before the "after" picture, the groups glide over motion-change-md with ease-move, and it resolves when done', async () => {
    const go: Go = {};
    await render(<List go={go} />);
    // What the page holds when the update returns, which is when the browser takes its "after" picture.
    const real = 'startViewTransition' in document ? document.startViewTransition.bind(document) : null;
    // The group animations, read as soon as the transition is ready: the browser makes them just before ready
    // settles, so read then they are running. Read after the update (as this did), a busy machine could get there
    // before they existed or after the 200 ms had run out, and find none.
    const groupsOf = () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith('::view-transition-group('));
    if (real) document.startViewTransition = ((arg: { update: () => void } | (() => void)) => {
      const vt = real(() => { (typeof arg === 'function' ? arg : arg.update)(); go.seen = [...document.querySelectorAll('#vt li')].map((li) => li.id); });
      go.groups = vt.ready.then(groupsOf);
      return vt;
    }) as typeof real;
    let done: Promise<void>;
    try { done = go.flip!() ; } finally { if (real) delete (document as { startViewTransition?: unknown }).startViewTransition; }
    if (real) {
      await expect.poll(() => go.seen).toEqual(['c', 'b', 'a']);
      const groups = await go.groups!;
      expect(groups.length).toBeGreaterThan(0);
      const e = groups[0].effect as KeyframeEffect;
      expect([e.getComputedTiming().duration, e.getKeyframes()[0].easing]).toEqual([200, 'cubic-bezier(0.65, 0, 0.35, 1)']);
    }
    await done;
    expect([...document.querySelectorAll('#vt li')].map((li) => li.id)).toEqual(['c', 'b', 'a']);
  });

  test('under reduced motion nothing travels: the old and new pictures only crossfade', async () => {
    if (server.browser !== 'chromium' || !('startViewTransition' in document)) return;   // media emulation is Chromium's
    const go: Go = {};
    await render(<List go={go} />);
    const session = cdp() as unknown as { send: (method: string, params: object) => Promise<unknown> };
    await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    try {
      const done = go.flip!() ;
      await expect.poll(() => document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith('::view-transition-'))).toBe(true);
      const kinds = document.getAnimations().map((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.replace(/\(.*/, '')).filter(Boolean);
      expect([kinds.includes('::view-transition-group'), kinds.includes('::view-transition-new')]).toEqual([false, true]);
      await done;
    } finally { await session.send('Emulation.setEmulatedMedia', { features: [] }); }
  });

  test('a transition cut short (the viewport resizes, another one starts) rejects nothing the page has to catch', async () => {
    if (!('startViewTransition' in document)) return;
    const go: Go = {};
    await render(<List go={go} />);
    const unhandled: unknown[] = [];
    const seen = (e: PromiseRejectionEvent) => { unhandled.push(e.reason); e.preventDefault(); };
    window.addEventListener('unhandledrejection', seen);
    try {
      const done = go.flip!();
      document.startViewTransition(() => {}).finished.catch(() => {});   // skips the first one before it is ready
      await done;
      await new Promise((r) => setTimeout(r, 100));
      expect(unhandled.map(String)).toEqual([]);
    } finally { window.removeEventListener('unhandledrejection', seen); }
  });

  test('without View Transitions the update just happens, at once', async () => {
    const go: Go = {};
    await render(<List go={go} />);
    const own = Object.getOwnPropertyDescriptor(Document.prototype, 'startViewTransition');
    if (own) delete (Document.prototype as { startViewTransition?: unknown }).startViewTransition;
    try {
      await go.flip!();
      expect([...document.querySelectorAll('#vt li')].map((li) => li.id)).toEqual(['c', 'b', 'a']);
    } finally { if (own) Object.defineProperty(Document.prototype, 'startViewTransition', own); }
  });
});
