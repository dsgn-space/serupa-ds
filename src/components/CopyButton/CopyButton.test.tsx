import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { announcerIdle } from '../../internal/announce';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { CopyButton } from './CopyButton';

const el = (id: string) => document.getElementById(id) as HTMLButtonElement;
const said = () => document.querySelector('[data-srp-announcer]')?.textContent;
const shout = () => document.querySelector('[data-srp-announcer-assertive]')?.textContent;
// The two words (the label and the copied one) are the button's only text: spans with words and no elements inside.
const labels = (e: Element) => [...e.querySelectorAll('span')].filter((s) => !s.children.length && s.textContent);
const shown = (id: string) => labels(el(id)).filter((s) => !s.hasAttribute('aria-hidden')).map((s) => s.textContent).join();
const icon = (id: string) => [...el(id).querySelectorAll<HTMLElement>('[data-icon]')].find((i) => getComputedStyle(i).opacity !== '0')!.dataset.icon;   // the one showing (both share a cell, KW18)

let clip: string[];
let writeText: ReturnType<typeof vi.fn>;
beforeEach(() => {
  clip = [];
  writeText = vi.fn(async (t: string) => { clip.push(t); });
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});
afterEach(() => { vi.useRealTimers(); });

describe('CopyButton', () => {
  test('a <button> "Copy" (outline, sm, a copy icon); pressing it copies value, shows a check and "Copied", says "Copied", then goes back after 2s; ref and props reach the button', async () => {
    const ref = React.createRef<HTMLButtonElement>(), copied: string[] = [];
    await render(<CopyButton id="c1" value="sk_live_1" ref={ref} data-x="y" onCopy={(t) => copied.push(t)} />);
    const b = el('c1');
    expect([b.tagName, b.type, ref.current === b, b.dataset.x, b.dataset.variant, b.dataset.size, shown('c1'), icon('c1'), b.hasAttribute('data-copied')]).toEqual(['BUTTON', 'button', true, 'y', 'outline', 'sm', 'Copy', 'content_copy', false]);
    await userEvent.click(b);
    await expect.poll(() => b.hasAttribute('data-copied')).toBe(true);
    expect([clip, copied, shown('c1'), icon('c1')]).toEqual([['sk_live_1'], ['sk_live_1'], 'Copied', 'check']);
    await expect.poll(() => announcerIdle() && said()).toBe('Copied');
    await expect.poll(() => b.hasAttribute('data-copied'), { timeout: 3500 }).toBe(false);
    expect([shown('c1'), icon('c1')]).toEqual(['Copy', 'content_copy']);
  });

  test('keyboard table: Tab reaches the button; Enter copies, and Space copies again once it\'s back; "Copied" is said each time (FH1)', async () => {
    await render(<div><button id="cb-before">before</button><CopyButton id="ck" value="k1" timeout={300} /></div>);
    el('cb-before').focus();
    await userEvent.tab();
    const at = document.activeElement?.id;
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => el('ck').hasAttribute('data-copied')).toBe(true);
    await expect.poll(() => announcerIdle() && said()).toBe('Copied');
    await expect.poll(() => el('ck').hasAttribute('data-copied'), { timeout: 2000 }).toBe(false);
    await userEvent.keyboard(' ');
    await expect.poll(() => el('ck').hasAttribute('data-copied')).toBe(true);
    expect([at, clip]).toEqual(['ck', ['k1', 'k1']]);
  });

  test('the width stays the same while it shows "Copied" (both labels share one cell, the hidden one isn\'t read out)', async () => {
    await render(<CopyButton id="w" value="x">OK</CopyButton>);
    await document.fonts.ready; // a font that finishes loading between the two reads changes the width
    // The layout width, not getBoundingClientRect: a press can scale the button (--button-press-scale, eased back), and CI
    // once read it mid-way (81.67 against 84).
    const before = css(el('w')).width;
    await userEvent.click(el('w'));
    await expect.poll(() => el('w').hasAttribute('data-copied')).toBe(true);
    expect(css(el('w')).width).toBe(before);
    expect(labels(el('w')).filter((s) => s.hasAttribute('aria-hidden')).map((s) => s.textContent)).toEqual(['OK']);
  });

  test('value as a function (sync or async) is called on press; children, copiedLabel and timeout change the words and the time', async () => {
    let n = 0;
    await render(<>
      <CopyButton id="f1" value={() => 'v' + (++n)}>Copy link</CopyButton>
      <CopyButton id="f2" value={async () => 'later'} copiedLabel="Link copied" timeout={300} />
    </>);
    await userEvent.click(el('f1'));
    await userEvent.click(el('f2'));
    await expect.poll(() => clip).toEqual(['v1', 'later']);
    expect([shown('f1'), shown('f2')]).toEqual(['Copied', 'Link copied']);
    await expect.poll(() => el('f2').hasAttribute('data-copied'), { timeout: 1000 }).toBe(false);
    expect(el('f1').hasAttribute('data-copied')).toBe(true);
  });

  test('an async value goes to the clipboard as a promise within the press (Safari refuses a write after it), and a second press while it\'s fetched does nothing (FE1)', async () => {
    const items: ClipboardItem[] = [];
    const write = vi.fn(async (x: ClipboardItem[]) => { items.push(...x); });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText, write }, configurable: true });
    let calls = 0, ready!: (t: string) => void;
    const copied: string[] = [];
    await render(<CopyButton id="fa" value={() => { calls++; return new Promise<string>((ok) => { ready = ok; }); }} onCopy={(t) => copied.push(t)} />);
    await userEvent.click(el('fa'));
    expect([write.mock.calls.length, items.length]).toEqual([1, 1]);   // written in the press, before the value is there
    // The button is busy now (aria-disabled), so the press is forced: Playwright would otherwise wait for it to be enabled.
    await userEvent.click(el('fa'), { force: true });
    expect(calls).toBe(1);   // the second press waits for the first
    ready('fetched');
    const blob = await items[0]!.getType('text/plain');
    expect(await blob.text()).toBe('fetched');
    await expect.poll(() => copied).toEqual(['fetched']);
    await expect.poll(announcerIdle).toBe(true);
    expect([shown('fa'), said(), writeText.mock.calls.length]).toEqual(['Copied', 'Copied', 0]);
  });

  test('an async value the browser won\'t take as a promise is written once it\'s there; a rejected value says copyFailed (FE1)', async () => {
    const write = vi.fn(async () => { throw new DOMException('no', 'NotAllowedError'); });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText, write }, configurable: true });
    const errors: unknown[] = [];
    await render(<>
      <CopyButton id="fb" value={async () => 'later'} />
      <CopyButton id="fc" value={() => Promise.reject(new Error('offline'))} onCopyError={(e) => errors.push(e)} />
    </>);
    await userEvent.click(el('fb'));
    await expect.poll(() => clip).toEqual(['later']);
    await userEvent.click(el('fc'));
    await expect.poll(() => errors.length).toBe(1);
    expect([(errors[0] as Error).message, el('fc').hasAttribute('data-copied')]).toEqual(['offline', false]);
  });

  test('iconOnly: just the icon, named by children with a tooltip; the name becomes "Copied" while the check shows', async () => {
    await render(<CopyButton id="io" value="npm i serupa-ds" iconOnly variant="ghost">Copy the command</CopyButton>);
    const b = el('io');
    expect([b.getAttribute('aria-label'), document.getElementById(b.getAttribute('aria-labelledby')!)?.textContent, labels(b).length, b.hasAttribute('data-icon-only')]).toEqual(['Copy the command', 'Copy the command', 0, true]);
    await userEvent.click(b);
    await expect.poll(() => b.getAttribute('aria-label')).toBe('Copied');
  });

  test('iconOnly: its name shows in a tooltip on keyboard focus, not only as a hover title, and says "Copied" after Enter', async () => {
    await render(<CopyButton id="io" value="npm i serupa-ds" iconOnly variant="ghost">Copy the command</CopyButton>);
    const b = el('io');
    const tip = () => { const t = document.getElementById((b.getAttribute('aria-labelledby') || '').split(' ').pop()!); return t && !t.hidden ? t.textContent : null; };
    expect([b.hasAttribute('title'), tip()]).toEqual([false, null]);
    b.focus({ focusVisible: true });
    await expect.poll(tip).toBe('Copy the command');
    await userEvent.keyboard('{Enter}');
    await expect.poll(tip).toBe('Copied');
    await render(<CopyButton id="own" value="x" iconOnly title="Mine">Copy</CopyButton>);
    expect([el('own').title, el('own').hasAttribute('aria-labelledby')]).toEqual(['Mine', false]);
  });

  test('when the browser refuses: no check, labels.copyFailed said assertively, onCopyError called; your onClick runs first and preventDefault stops the copy', async () => {
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    const errs: unknown[] = [], clicks: string[] = [];
    await render(<>
      <CopyButton id="bad" value="x" onCopyError={(e) => errs.push(e)} onClick={() => clicks.push('bad')} />
      <CopyButton id="stop" value="y" onClick={(e) => { clicks.push('stop'); e.preventDefault(); }} />
    </>);
    await userEvent.click(el('bad'));
    await expect.poll(() => errs.length).toBe(1);
    await expect.poll(() => announcerIdle() && shout()).toBe('Couldn’t copy. Select the text and copy it yourself.');
    expect([el('bad').hasAttribute('data-copied'), clicks]).toEqual([false, ['bad']]);
    // Shown, not only said: an error icon (not color alone: its own shape) and "Couldn't copy", for the timeout.
    const [copyIcon, , failedIcon] = [...el('bad').querySelectorAll('svg')].map((s) => s.parentElement);   // copy, done, failed, in that order (each drawn in its own span)
    expect([el('bad').hasAttribute('data-failed'), shown('bad')]).toEqual([true, 'Couldn’t copy']);
    await expect.poll(() => [getComputedStyle(failedIcon!).opacity, getComputedStyle(copyIcon!).opacity]).toEqual(['1', '0']);
    writeText.mockReset();
    await userEvent.click(el('stop'));
    expect([clicks, writeText.mock.calls.length, el('stop').hasAttribute('data-copied')]).toEqual([['bad', 'stop'], 0, false]);
    vi.restoreAllMocks();
  });

  test('a copy that fails while the last one still shows "Copied" takes the check away and says it failed, so it doesn\'t claim this one worked (L8E60)', async () => {
    const errs: unknown[] = [];
    await render(<CopyButton id="again" value="x" onCopyError={(e) => errs.push(e)} />);
    await userEvent.click(el('again'));
    await expect.poll(() => el('again').hasAttribute('data-copied')).toBe(true);
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    await userEvent.click(el('again'));
    await expect.poll(() => errs.length).toBe(1);
    expect([el('again').hasAttribute('data-copied'), shown('again')]).toEqual([false, 'Couldn’t copy']);
    vi.restoreAllMocks();
  });

  test('without the Clipboard API it falls back to execCommand("copy") and keeps focus on the button', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    await render(<CopyButton id="old" value="legacy" />);
    await userEvent.click(el('old'));
    await expect.poll(() => el('old').hasAttribute('data-copied')).toBe(true);
    expect([exec.mock.calls[0]![0], document.activeElement === el('old'), document.querySelector('textarea')]).toEqual(['copy', true, null]);
    vi.restoreAllMocks();
  });

  test('inside a shadow root, the execCommand fallback keeps focus on the button too (GR95)', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    vi.spyOn(document, 'execCommand').mockReturnValue(true);
    const host = document.createElement('div');
    document.body.append(host);
    const inner = document.createElement('div');
    host.attachShadow({ mode: 'open' }).append(inner);
    try {
      await render(<CopyButton id="sh" value="legacy" />, { container: inner });
      const b = host.shadowRoot!.getElementById('sh')!;
      await userEvent.click(b);
      await expect.poll(() => b.hasAttribute('data-copied')).toBe(true);
      expect([host.shadowRoot!.activeElement === b, document.querySelector('textarea')]).toEqual([true, null]);
    } finally { host.remove(); vi.restoreAllMocks(); }
  });

  test('L8E96 without the Clipboard API, in a modal <dialog> (the page behind it is inert), the fallback still copies the text; it selected nothing', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    let selected = '';
    vi.spyOn(document, 'execCommand').mockImplementation(() => { selected = String(document.getSelection()); return true; });
    await render(<dialog id="l8e96-d"><CopyButton id="l8e96" value="secret-token" /></dialog>);
    (document.getElementById('l8e96-d') as HTMLDialogElement).showModal();
    await userEvent.click(el('l8e96'));
    await expect.poll(() => el('l8e96').hasAttribute('data-copied')).toBe(true);
    expect([selected, document.activeElement === el('l8e96'), document.querySelector('textarea')]).toEqual(['secret-token', true, null]);
    (document.getElementById('l8e96-d') as HTMLDialogElement).close();
    vi.restoreAllMocks();
  });

  test('labels follow the provider: "Salin", "Disalin" in Indonesian', async () => {
    await render(<SerupaProvider labels={idLabels}><CopyButton id="id" value="x" /></SerupaProvider>);
    expect(shown('id')).toBe('Salin');
    await userEvent.click(el('id'));
    await expect.poll(() => shown('id')).toBe('Disalin');
  });

  test('contrast: the check and the error icon keep 3:1 on outline, ghost and secondary buttons in every theme', async () => {
    await render(<>{(['outline', 'ghost', 'secondary'] as const).map((v) => <CopyButton key={v} id={'v-' + v} variant={v} value="x" />)}</>);
    for (const v of ['outline', 'ghost', 'secondary']) { await userEvent.click(el('v-' + v)); }
    await expect.poll(() => document.querySelectorAll('[data-copied]').length).toBe(3);
    const still = document.createElement('style'); still.textContent = '*, *::before, *::after { transition: none !important; }'; document.head.appendChild(still);
    const low: string[] = []; let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const v of ['outline', 'ghost', 'secondary']) {
        const b = el('v-' + v), bg = css(b).backgroundColor === 'rgba(0, 0, 0, 0)' ? 'var(--surface)' : css(b).backgroundColor;
        for (const icon of ['check', 'error']) {
          const r = contrast(css(b.querySelector(`[data-icon="${icon}"]`)).color, bg); n++;
          if (r < 3) low.push(`${th} ${v} ${icon} ${r.toFixed(2)}`);
        }
      }
    }
    document.documentElement.setAttribute('data-theme', 'blue-light'); still.remove();
    expect([low, n]).toEqual([[], 36]);
  });
});

describe('CopyButton surface', () => {
  test('takes Button\'s surface: white over dark media, black over light, in its fill or its text', async () => {
    await render(<div><CopyButton id="om-dark" value="k1" surface="dark" /><CopyButton id="om-light" value="k2" surface="light" /></div>);
    const inks = (id: string) => { const s = getComputedStyle(document.getElementById(id)!); return [s.color, s.backgroundColor]; };
    expect(document.getElementById('om-dark')!.className).toContain('srp-btn--on-dark');
    expect(inks('om-dark')).toContain('rgb(255, 255, 255)');
    expect(document.getElementById('om-light')!.className).toContain('srp-btn--on-light');
    expect(inks('om-light')).toContain('rgb(0, 0, 0)');
  });
});
