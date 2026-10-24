import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { contrastRatio, normalizeHex } from '../../internal/color';
import { Field } from '../Field/Field';
import { ColorPicker } from './ColorPicker';

const SW = [{ value: '#1D4ED8', label: 'Blue' }, { value: '#fde047', label: 'Yellow' }, '#fff', { value: '#18181b', label: 'Black' }];
const group = () => document.querySelector('[role="radiogroup"]') as HTMLElement;
const radios = () => [...document.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
const swatch = (name: string) => radios().find((r) => r.getAttribute('aria-label') === name)!;
const hex = () => document.querySelector('.dk-color-picker__hex input') as HTMLInputElement;
const line = () => document.querySelector('.dk-color-picker__contrast') as HTMLElement;

function Controlled({ calls }: { calls: string[] }) {
  const [v, setV] = React.useState<string | null>('#1d4ed8');
  return <ColorPicker aria-label="Label color" swatches={SW} value={v} onValueChange={(x) => { calls.push(x); setV(x); }} contrastWith="#ffffff" />;
}

describe('ColorPicker', () => {
  test('a radiogroup of swatches named by their labels (a bare hex by its code), the picked one checked with a check icon; one Tab stop', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<ColorPicker ref={ref} id="cp" className="extra" aria-label="Label color" swatches={SW} defaultValue="#1d4ed8" />);
    expect([group().getAttribute('aria-label'), radios().map((r) => r.getAttribute('aria-label')), radios().map((r) => r.getAttribute('aria-checked')), radios().map((r) => r.tabIndex)])
      .toEqual(['Label color', ['Blue', 'Yellow', '#ffffff', 'Black'], ['true', 'false', 'false', 'false'], [0, -1, -1, -1]]);
    expect([ref.current === document.getElementById('cp'), ref.current!.className, ref.current!.dataset.component, !!swatch('Blue').querySelector('.dk-icon'), css(swatch('Blue')).backgroundColor])
      .toEqual([true, 'dk-color-picker dk-color-picker--size-md extra', 'color-picker', true, 'rgb(29, 78, 216)']);
  });

  test('arrow keys, Home and End move and pick, wrapping; a click picks; onValueChange gets lowercase #rrggbb', async () => {
    const calls: string[] = [];
    await render(<Controlled calls={calls} />);
    swatch('Blue').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect([document.activeElement === swatch('Yellow'), swatch('Yellow').getAttribute('aria-checked'), calls]).toEqual([true, 'true', ['#fde047']]);
    await userEvent.keyboard('{End}{ArrowDown}{Home}{ArrowLeft}');
    expect([calls, document.activeElement === swatch('Black')]).toEqual([['#fde047', '#18181b', '#1d4ed8', '#18181b'], true]);
    await userEvent.click(swatch('#ffffff'));
    expect(calls.at(-1)).toBe('#ffffff');
  });

  test('the hex field: six digits pick the color as people type, three on blur or Enter; a bad code goes back on blur and is marked invalid while typed', async () => {
    const calls: string[] = [];
    await render(<Controlled calls={calls} />);
    expect(hex().value).toBe('1d4ed8');
    await userEvent.fill(hex(), '#7C3AED');
    expect([calls, radios().every((r) => r.getAttribute('aria-checked') === 'false')]).toEqual([['#7c3aed'], true]);
    await userEvent.fill(hex(), 'f0a');
    expect(calls).toEqual(['#7c3aed']);
    await userEvent.keyboard('{Enter}');
    expect([calls.at(-1), hex().value]).toEqual(['#ff00aa', 'ff00aa']);
    await userEvent.fill(hex(), 'zz');
    expect(hex().getAttribute('aria-invalid')).toBe('true');
    hex().blur();
    await expect.poll(() => hex().value).toBe('ff00aa');
    expect(hex().hasAttribute('aria-invalid')).toBe(false);
  });

  test('the browser\'s color input picks too, and is named', async () => {
    const calls: string[] = [];
    await render(<Controlled calls={calls} />);
    const native = document.querySelector('input[type="color"]') as HTMLInputElement;
    expect([native.getAttribute('aria-label'), native.value]).toEqual(['Custom color', '#1d4ed8']);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(native, '#00ff00');   // past React's value tracking
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await expect.poll(() => calls.at(-1)).toBe('#00ff00');
  });

  test('contrastWith: the WCAG ratio, rounded down, in a polite live region; below minContrast it warns', async () => {
    const calls: string[] = [];
    await render(<Controlled calls={calls} />);
    expect([line().getAttribute('aria-live'), line().textContent, line().querySelector('.dk-icon')]).toEqual(['polite', 'Contrast 6.7:1', null]);
    await userEvent.click(swatch('Yellow'));
    expect([line().textContent, line().classList.contains('dk-color-picker__contrast--low'), !!line().querySelector('.dk-icon')])
      .toEqual(['Contrast 1.3:1, below 4.5:1, which can be hard to read', true, true]);
  });

  test('minContrast 3; Indonesian words and the locale\'s decimal mark', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><ColorPicker aria-label="Warna" swatches={SW} defaultValue="#767676" contrastWith="#ffffff" minContrast={3} /></SerupaProvider>);
    expect(line().textContent).toBe('Kontras 4,5:1');
    await userEvent.click(swatch('Yellow'));
    expect(line().textContent).toBe('Kontras 1,3:1, di bawah 3,0:1, bisa sulit dibaca');
  });

  test('in a Field: named by its label, and focusing the picker (a label click) focuses the picked swatch', async () => {
    await render(<Field label="Brand color"><ColorPicker swatches={SW} defaultValue="#fde047" /></Field>);
    const lbl = document.querySelector('label')!;
    expect(group().getAttribute('aria-labelledby')).toBe(lbl.id);
    (document.querySelector('.dk-color-picker') as HTMLElement).focus();
    expect(document.activeElement === swatch('Yellow')).toBe(true);
  });

  test('disabled, custom={false}, size sm and name: no field, disabled swatches, a hidden input with the value', async () => {
    await render(<form id="f"><ColorPicker aria-label="C" swatches={SW} defaultValue="#18181b" custom={false} size="sm" name="color" disabled /></form>);
    expect([hex(), radios().every((r) => r.disabled), Math.round(radios()[0].getBoundingClientRect().width), (document.querySelector('input[type="hidden"]') as HTMLInputElement).value])
      .toEqual([null, true, 24, '#18181b']);
  });

  test('the check is white or black, whichever stands out on the swatch (3:1 or more); the ring keeps 3:1 and the contrast line 4.5:1 on the page in all six themes', async () => {
    await render(<div style={{ background: 'var(--surface)', padding: '8px' }}><ColorPicker aria-label="C" swatches={SW} defaultValue="#fde047" contrastWith="#ffffff" /></div>);
    const low: string[] = [];
    for (const v of ['#1D4ED8', '#fde047', '#fff', '#18181b']) {
      await userEvent.click(radios()[SW.findIndex((s) => (typeof s === 'string' ? s : s.value) === v)]);
      const b = radios().find((r) => r.getAttribute('aria-checked') === 'true')!;
      const r = contrast(css(b.querySelector('.dk-icon')).color, css(b).backgroundColor);
      if (r < 3) low.push(`${v} check ${r.toFixed(2)}`);
    }
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
      const b = radios().find((r) => r.getAttribute('aria-checked') === 'true')!;
      const r = contrast(css(b).outlineColor, css(b.closest('div[style]')).backgroundColor);
      if (r < 3) low.push(`${th} ring ${r.toFixed(2)}`);
      const w = contrast(css(line()).color, css(b.closest('div[style]')).backgroundColor);
      if (w < 4.5) low.push(`${th} ${line().className} ${w.toFixed(2)}`);
    }
    document.documentElement.removeAttribute('data-theme');
    expect(low).toEqual([]);
  });

  test('normalizeHex and contrastRatio', () => {
    expect([normalizeHex('#ABC'), normalizeHex('abcdef'), normalizeHex(' #1D4ED8 '), normalizeHex('#abcd'), normalizeHex('red'), contrastRatio('#000', '#fff'), contrastRatio('#777', '#777'), contrastRatio('x', '#fff')])
      .toEqual(['#aabbcc', '#abcdef', '#1d4ed8', null, null, 21, 1, null]);
  });
});
