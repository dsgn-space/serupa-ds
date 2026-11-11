// useCopyToClipboard: CopyButton's copying for a control that isn't a CopyButton, such as a menu item.
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { announcerIdle } from './announce';
import { SerupaProvider } from './provider';
import { idLabels } from './labels';
import { useCopyToClipboard, type CopyToClipboardOptions } from './clipboard';
import { useCopyToClipboard as exported } from '../index';

const said = () => document.querySelector('[data-dk-announcer]')?.textContent;
const shout = () => document.querySelector('[data-dk-announcer-assertive]')?.textContent;
let clip: string[];
let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  clip = [];
  writeText = vi.fn(async (t: string) => { clip.push(t); });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});
afterEach(() => { vi.useRealTimers(); });

const results: boolean[] = [];
function CopyLink({ value, ...options }: CopyToClipboardOptions & { value: string | (() => string | Promise<string>) }) {
  const { copy, copied, error } = useCopyToClipboard(options);
  return <button type="button" id="b" data-error={error ? '' : undefined} onClick={() => { void copy(value).then((ok) => results.push(ok)); }}>{copied ? 'Link copied' : 'Copy link'}</button>;
}
const b = () => document.getElementById('b') as HTMLButtonElement;

describe('useCopyToClipboard', () => {
  test('the package exports it', () => { expect(exported).toBe(useCopyToClipboard); });

  test('copies, sets copied for the timeout, says "Copied" and resolves true', async () => {
    results.length = 0;
    await render(<CopyLink value="https://example.com/a" timeout={300} />);
    await userEvent.click(b());
    await expect.poll(() => b().textContent).toBe('Link copied');
    expect([clip, results]).toEqual([['https://example.com/a'], [true]]);
    await expect.poll(() => announcerIdle() && said()).toBe('Copied');
    await expect.poll(() => b().textContent).toBe('Copy link');
  });

  test('a function value and a promise of one are copied, in the provider\'s words', async () => {
    await render(<SerupaProvider labels={idLabels}><CopyLink value={() => Promise.resolve('later')} /></SerupaProvider>);
    await userEvent.click(b());
    await expect.poll(() => clip).toEqual(['later']);
    await expect.poll(() => announcerIdle() && said()).toBe('Disalin');
  });

  test('when the browser refuses it resolves false, keeps the error and says so assertively; announce: false stays quiet', async () => {
    results.length = 0;
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    const r = await render(<CopyLink value="x" />);
    await userEvent.click(b());
    await expect.poll(() => results).toEqual([false]);
    expect([b().hasAttribute('data-error'), b().textContent]).toEqual([true, 'Copy link']);
    await expect.poll(() => shout()).toBe('Couldn’t copy. Select the text and copy it yourself.');
    vi.mocked(document.execCommand).mockRestore();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t: string) => { clip.push(t); return Promise.resolve(); } }, configurable: true });
    await r.rerender(<CopyLink value="quiet" announce={false} copiedLabel="Link copied" />);
    await userEvent.click(b());
    await expect.poll(() => results).toEqual([false, true]);
    expect([clip, b().hasAttribute('data-error')]).toEqual([['quiet'], false]);
  });
});
