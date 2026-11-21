import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MaskedValue, maskValue } from './MaskedValue';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const visible = (id: string) => [...el(id).children].find((c) => c.localName === 'span' && c.textContent)!.textContent;   // the value: the first text after the Show button
const spoken = (id: string) => el(id).querySelector('span[aria-hidden] + span')?.textContent;
const toggle = (id: string) => el(id).querySelector('button')!;

describe('MaskedValue', () => {
  test('renders a <span>; ref, className and other props reach it; the end is kept behind a fixed run of bullets', async () => {
    const ref = React.createRef<HTMLSpanElement>();
    await render(<MaskedValue id="x" ref={ref} className="extra" data-x="y" value="4111111111111208" label="Card number" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['SPAN', true, 'srp-masked-value extra', 'y', 'masked-value']);
    expect(visible('x')).toBe('•••• 1208');
  });

  test('the full value is nowhere in the page while masked; screen readers hear what it is and the end, not the bullets', async () => {
    await render(<MaskedValue id="sr" value="4111111111111208" label="Card number" />);
    expect(el('sr').outerHTML).not.toContain('411111');
    expect(el('sr').querySelector('span')!.getAttribute('aria-hidden')).toBe('true');
    expect(spoken('sr')).toBe('Card number ending in 1208');
  });

  test('the bullets don\'t give away the length; start and end choose what is kept; end={0} hides it all', async () => {
    await render(<>
      <MaskedValue id="a" value="12345678" label="PIN" end={2} />
      <MaskedValue id="b" value="1234567890123456" label="PIN" end={2} />
      <MaskedValue id="c" value="ada@example.com" label="Email" start={1} end={0} />
      <MaskedValue id="d" value="Rp 12.400.000" label="Balance" end={0} />
    </>);
    expect([visible('a'), visible('b'), visible('c'), visible('d')]).toEqual(['•••• 78', '•••• 56', 'a••••', '••••']);
    expect([spoken('c'), spoken('d')]).toEqual(['Email, hidden', 'Balance, hidden']);
  });

  test('asking to keep more than half keeps nothing, since the rest wouldn\'t be hidden; characters are counted as people see them', () => {
    expect([maskValue('123456', 0, 4), maskValue('12345678', 2, 2), maskValue('👩‍👩‍👧😀😀😀😀😀😀😀😀', 0, 1)]).toEqual(['••••', '12•••• 78', '•••• 😀']);
  });

  test('revealable: a Show button, pressed while the whole value shows; it hides again when the page is left', async () => {
    const seen: boolean[] = [];
    await render(<MaskedValue id="rv" value="+6281234567402" label="Phone" end={3} revealable onRevealedChange={(v) => seen.push(v)} />);
    const b = toggle('rv');
    expect([b.getAttribute('aria-label'), b.getAttribute('aria-pressed')]).toEqual(['Show Phone', 'false']);
    await userEvent.click(b);
    expect([visible('rv'), spoken('rv'), toggle('rv').getAttribute('aria-pressed'), seen]).toEqual(['+6281234567402', undefined, 'true', [true]]);
    expect(document.activeElement).toBe(toggle('rv'));
    const state = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    try { document.dispatchEvent(new Event('visibilitychange')); } finally { state.mockRestore(); }
    await expect.poll(() => visible('rv')).toBe('•••• 402');
    expect(seen).toEqual([true, false]);
  });

  test('revealed is controlled; without revealable it is ignored', async () => {
    const r = await render(<><MaskedValue id="c1" value="4111111111111208" label="Card" revealable revealed /><MaskedValue id="c2" value="4111111111111208" label="Card" revealed /></>);
    expect([visible('c1'), visible('c2'), el('c2').querySelector('button')]).toEqual(['4111111111111208', '•••• 1208', null]);
    await userEvent.click(toggle('c1'));
    expect(visible('c1')).toBe('4111111111111208');   // controlled: stays until the parent changes it
    await r.rerender(<MaskedValue id="c1" value="4111111111111208" label="Card" revealable revealed={false} />);
    expect(visible('c1')).toBe('•••• 1208');
  });

  test('its words come from the labels: Indonesian under an id provider', async () => {
    await render(<SerupaProvider labels={idLabels}><MaskedValue id="idv" value="4111111111111208" label="Nomor kartu" revealable /></SerupaProvider>);
    expect([spoken('idv'), toggle('idv').getAttribute('aria-label')]).toEqual(['Nomor kartu berakhiran 1208', 'Tampilkan Nomor kartu']);
  });

  test('a long revealed value wraps inside a narrow column rather than widening it', async () => {
    await render(<div style={{ width: 160 }}><MaskedValue id="lw" value="GB82WEST12345698765432GB82WEST12345698765432" label="Account" revealable revealed /></div>);
    expect(el('lw').getBoundingClientRect().width).toBeLessThanOrEqual(160);
  });

  test('Show stays under the pointer as the value appears, so a second press hides it again', async () => {
    const screen = await render(<MaskedValue value="sk_live_51Hq8f2KcX9vR" label="API key" start={8} end={0} revealable />);
    const show = screen.getByRole('button', { name: 'Show API key' });
    const before = show.element().getBoundingClientRect();
    await userEvent.click(show);
    const after = show.element().getBoundingClientRect();
    expect([after.left - before.left, show.element().getAttribute('aria-pressed')]).toEqual([0, 'true']);
    await userEvent.click(show);
    expect(show.element().getAttribute('aria-pressed')).toBe('false');
  });
});
