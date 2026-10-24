import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Field } from '../Field/Field';
import { PhoneInput, type PhoneValueDetails } from './PhoneInput';
import { PHONE_COUNTRIES, formatNational, formatPhone, parsePhone, phoneCountry } from './phone';

const field = (id: string) => document.getElementById(id) as HTMLInputElement;
const box = (id: string) => field(id).parentElement as HTMLElement;
const menu = (id: string) => box(id).querySelector('select') as HTMLSelectElement;
const part = (id: string) => box(id).querySelector('.dk-phone-input__country') as HTMLElement;
const dial = (id: string) => (box(id).querySelector('.dk-phone-input__dial') as HTMLElement).textContent;
const settled = () => expect.poll(() => document.getAnimations().length).toBe(0);
const pick = (sel: HTMLSelectElement, code: string) => userEvent.selectOptions(sel, code);

let errors: ReturnType<typeof vi.spyOn>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); });

const Wrap = ({ children }: { children: React.ReactNode }) => <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>;

describe('PhoneInput', () => {
  test('Input\'s box around a country menu and a tel field (tel-national, inputmode tel); ref to the field, className and style to the box', async () => {
    const ref = React.createRef<HTMLInputElement>();
    await render(<Wrap><PhoneInput id="p" aria-label="Phone" defaultCountry="ID" ref={ref} className="extra" style={{ marginTop: '2px' }} /></Wrap>);
    const i = field('p'), b = box('p');
    expect([i.type, i.inputMode, i.getAttribute('autocomplete'), ref.current === i]).toEqual(['tel', 'tel', 'tel-national', true]);
    expect([b.className, b.dataset.component, b.style.marginTop, b.getBoundingClientRect().height]).toEqual(['dk-input dk-phone-input dk-input--size-md extra', 'phone-input', '2px', 32]);
    expect([menu('p').getAttribute('aria-label'), menu('p').value, dial('p')]).toEqual(['Country', 'ID', '+62']);
    // Each option names the country in the locale's words, with its calling code, sorted by name.
    const names = [...menu('p').options].map((o) => o.textContent!);
    expect(names).toContain('Indonesia (+62)');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en-US')));
    expect(names.length).toBe(PHONE_COUNTRIES.length);
  });

  test('typing groups the number by the country\'s pattern and drops a typed trunk 0; onValueChange gets E.164 and whether it\'s complete', async () => {
    const calls: Array<[string, PhoneValueDetails]> = [];
    await render(<Wrap><PhoneInput id="p" aria-label="Phone" defaultCountry="ID" onValueChange={(v, d) => calls.push([v, d])} /></Wrap>);
    await userEvent.type(field('p'), '0812345');
    expect(field('p').value).toBe('812-345');
    expect(calls.at(-1)).toEqual(['+62812345', { country: 'ID', national: '812345', complete: false }]);
    await userEvent.type(field('p'), '67890');
    expect(field('p').value).toBe('812-3456-7890');
    expect(calls.at(-1)).toEqual(['+6281234567890', { country: 'ID', national: '81234567890', complete: true }]);
    // No more digits than the country uses (12 in ID).
    await userEvent.type(field('p'), '12345');
    expect(field('p').value.replace(/\D/g, '').length).toBe(12);
  });

  test('Backspace after a separator removes the digit before it; typing in the middle keeps the caret after the new digit', async () => {
    await render(<Wrap><PhoneInput id="p" aria-label="Phone" defaultCountry="US" defaultValue="+12015550123" /></Wrap>);
    const i = field('p');
    expect(i.value).toBe('(201) 555-0123');
    i.focus();
    i.setSelectionRange(10, 10);   // after "555-"
    await userEvent.keyboard('{Backspace}');
    expect([i.value, i.selectionStart]).toEqual(['(201) 550-123', 8]);
    i.setSelectionRange(1, 1);     // after "("
    await userEvent.keyboard('9');
    expect([i.value, i.selectionStart]).toEqual(['(920) 155-0123', 2]);
  });

  test('pasting "+…" picks the country from the calling code (the picked one first when it shares it); picking a country keeps the digits', async () => {
    const countries: string[] = [];
    await render(<Wrap>
      <PhoneInput id="p" aria-label="Phone" defaultCountry="US" onCountryChange={(c) => countries.push(c)} />
      <PhoneInput id="ca" aria-label="Canada" defaultCountry="CA" />
    </Wrap>);
    await userEvent.fill(field('p'), '+44 7400 123456');   // as a paste into the empty field
    expect([menu('p').value, dial('p'), field('p').value, countries.join()]).toEqual(['GB', '+44', '7400 123456', 'GB']);
    await pick(menu('p'), 'AU');
    expect([dial('p'), field('p').value, countries.join()]).toEqual(['+61', '740 012 345', 'GB,AU']);
    await userEvent.fill(field('ca'), '001 416 555 0199');
    expect([menu('ca').value, field('ca').value]).toEqual(['CA', '(416) 555-0199']);
  });

  test('controlled: value in E.164 is shown grouped and follows the parent; the default country comes from the locale\'s region', async () => {
    function Ctl() {
      const [v, setV] = React.useState('+819012345678');
      return <>
        <PhoneInput id="c" aria-label="Ctl" value={v} onValueChange={setV} />
        <button type="button" onClick={() => setV('+33612345678')}>France</button>
        <output>{v}</output>
      </>;
    }
    await render(<Wrap><SerupaProvider locale="ja-JP"><Ctl /><PhoneInput id="d" aria-label="Default" /></SerupaProvider></Wrap>);
    expect([menu('c').value, field('c').value, menu('d').value]).toEqual(['JP', '90-1234-5678', 'JP']);
    await userEvent.type(field('c'), '{Backspace}');
    expect([field('c').value, document.querySelector('output')!.textContent]).toEqual(['90-1234-567', '+81901234567']);
    await userEvent.click(document.querySelector('button')!);
    await expect.poll(() => [menu('c').value, field('c').value]).toEqual(['FR', '6 12 34 56 78']);
  });

  test('Field labels the number; countries limits the menu; name submits E.164; disabled covers both; Indonesian labels; size sm and lg', async () => {
    await render(<Wrap>
      <form id="f">
        <Field label="Nomor HP"><PhoneInput id="fp" name="phone" countries={['SG', 'ID', 'MY']} defaultValue="+6591234567" /></Field>
      </form>
      <SerupaProvider labels={idLabels}><PhoneInput id="id" aria-label="HP" defaultCountry="ID" size="sm" /></SerupaProvider>
      <PhoneInput id="dis" aria-label="Off" disabled size="lg" />
    </Wrap>);
    expect([field('fp').labels![0].textContent, [...menu('fp').options].map((o) => o.value).join(), menu('fp').value]).toEqual(['Nomor HP', 'ID,MY,SG', 'SG']);
    expect(new FormData(document.getElementById('f') as HTMLFormElement).get('phone')).toBe('+6591234567');
    expect([menu('id').getAttribute('aria-label'), Math.round(box('id').getBoundingClientRect().height)]).toEqual(['Negara', 24]);
    expect([field('dis').disabled, menu('dis').disabled, box('dis').className.includes('dk-input--disabled'), Math.round(box('dis').getBoundingClientRect().height)]).toEqual([true, true, true, 44]);
  });

  test('the menu has its own 2px focus ring inside the box; the tokens override it; contrast of the code and chevron in all six themes', async () => {
    await render(<Wrap>
      <PhoneInput id="p" aria-label="Phone" defaultCountry="ID" />
      <PhoneInput id="t" aria-label="Tok" style={{ '--phone-input-dial': 'rgb(1, 2, 3)' } as React.CSSProperties} />
    </Wrap>);
    field('p').focus();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(menu('p'));
    expect([css(part('p')).outlineStyle, css(part('p')).outlineWidth]).toEqual(['solid', '2px']);
    expect(css(part('t')).color).toBe('rgb(1, 2, 3)');
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      void css(box('p')).backgroundColor;
      await settled();
      const bg = css(box('p')).backgroundColor;
      for (const [name, fg, min] of [['code', css(part('p')).color, 4.5], ['chevron', css(part('p').querySelector('.dk-icon')).color, 3], ['number', css(field('p')).color, 4.5]] as const) {
        const r = contrast(fg, bg);
        if (r < min) low.push(`${th} ${name} ${r.toFixed(2)}`);
      }
    }
    expect(low).toEqual([]);
  });

  test('the helpers: parsePhone, formatPhone, formatNational', () => {
    expect(parsePhone('+62 0812-3456-7890')).toEqual({ country: phoneCountry('ID'), national: '81234567890' });
    expect(parsePhone('+1 416 555 0199', 'CA')!.country.code).toBe('CA');
    expect(parsePhone('+1 416 555 0199')!.country.code).toBe('US');
    expect([parsePhone('0812'), parsePhone('+999 1')]).toEqual([undefined, undefined]);
    expect([formatPhone('+6281234567890'), formatPhone('+74951234567'), formatPhone('+999123')]).toEqual(['+62 812-3456-7890', '+7 495 123-45-67', '+999123']);
    expect(formatNational('81234567890123', phoneCountry('ID')!)).toBe('812-3456-7890123');
  });
});
