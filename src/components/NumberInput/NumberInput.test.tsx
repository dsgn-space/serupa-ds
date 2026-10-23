import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { NumberInput } from './NumberInput';

const field = (id: string) => document.getElementById(id) as HTMLInputElement;
const steps = (id: string) => [...field(id).parentElement!.querySelectorAll<HTMLButtonElement>('.dk-number-input__step')];
const minus = (id: string) => steps(id)[0]!;
const plus = (id: string) => steps(id)[1]!;
// Replaces the field's text, as a person selecting it all and typing would, then (optionally) leaves it.
const fill = async (id: string, text: string) => { await userEvent.fill(field(id), text); };
const blur = async (id: string) => { field(id).blur(); await expect.poll(() => document.activeElement !== field(id)).toBe(true); };
const Col = ({ children }: { children: React.ReactNode }) => <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>;

function Qty({ r }: { r?: React.Ref<HTMLInputElement> }) {
  return <Col><label htmlFor="qty">Quantity</label><NumberInput id="qty" ref={r} className="extra" defaultValue={5} min={0} max={100} /></Col>;
}

function Controlled({ calls, set }: { calls: Array<number | null>; set?: (f: (v: number | null) => void) => void }) {
  const [v, setV] = React.useState<number | null>(2);
  React.useEffect(() => { if (set) set(setV); }, [set]);
  return <NumberInput id="nctl" aria-label="Guests" value={v} min={1} max={4} onValueChange={(n) => { calls.push(n); setV(n); }} />;
}

describe('NumberInput', () => {
  test('Input\'s box (32px) around a spinbutton with valuenow 5, min 0, max 100, numeric keyboard; − and + buttons out of the Tab order; ref to the input, className to the box', async () => {
    const r = React.createRef<HTMLInputElement>();
    await render(<Qty r={r} />);
    const i = field('qty'), box = i.parentElement!;
    expect([i.type, i.getAttribute('role'), i.getAttribute('aria-valuenow'), i.getAttribute('aria-valuemin'), i.getAttribute('aria-valuemax'), i.inputMode, r.current === i])
      .toEqual(['text', 'spinbutton', '5', '0', '100', 'numeric', true]);
    expect(box.className).toMatch(/dk-input dk-number-input dk-input--size-md/);
    expect(box.className).toMatch(/extra/);
    expect([box.dataset.component, box.getBoundingClientRect().height, i.labels![0]!.textContent, i.value]).toEqual(['number-input', 32, 'Quantity', '5']);
    expect(steps('qty').map((b) => `${b.getAttribute('aria-label')}:${b.tabIndex}:${b.querySelector<HTMLElement>('.dk-icon')?.dataset.icon}`)).toEqual(['Decrease:-1:remove', 'Increase:-1:add']);
  });

  test('keys: ArrowUp/Down ±1, PageUp +10, Shift+ArrowDown −10, End and Home go to max and min, and it stays within them; at min − is disabled and + isn\'t', async () => {
    await render(<Qty />);
    field('qty').focus();
    const seen: string[] = [];
    for (const k of ['{ArrowUp}', '{ArrowDown}{ArrowDown}', '{PageUp}', '{Shift>}{ArrowDown}{/Shift}', '{End}', '{ArrowUp}', '{Home}', '{ArrowDown}']) {
      await userEvent.keyboard(k);
      seen.push(field('qty').value);
    }
    expect(seen).toEqual(['6', '4', '14', '4', '100', '100', '0', '0']);
    expect([minus('qty').disabled, plus('qty').disabled]).toEqual([true, false]);
  });

  test('on blur: 250 is clamped to 100, " 7 " becomes 7, junk goes back to the last number, and empty stays empty', async () => {
    await render(<Qty />);
    const seen: string[] = [];
    for (const text of ['250', ' 7 ', 'abc', '']) {
      await fill('qty', text);
      await blur('qty');
      seen.push(field('qty').value);
    }
    expect(seen).toEqual(['100', '7', '7', '']);
  });

  test('+ on an empty field starts from min + step (0 → 1), and moves focus into the field', async () => {
    await render(<Qty />);
    await fill('qty', '');
    await blur('qty');
    await userEvent.click(plus('qty'));
    expect([field('qty').value, document.activeElement === field('qty')]).toEqual(['1', true]);
  });

  test('controlled: + calls onValueChange (3, 4) and stops at max, where + is disabled', async () => {
    const calls: Array<number | null> = [];
    await render(<Controlled calls={calls} />);
    await userEvent.click(plus('nctl'));
    await userEvent.click(plus('nctl'));
    await userEvent.click(plus('nctl'), { force: true });
    expect([calls.join(), field('nctl').value, plus('nctl').disabled]).toEqual(['3,4', '4', true]);
  });

  test('controlled: a new value from outside shows in the field', async () => {
    let setV: (v: number | null) => void = () => {};
    await render(<Controlled calls={[]} set={(f) => { setV = f; }} />);
    setV(1);
    await expect.poll(() => field('nctl').value).toBe('1');
  });

  test('controlled: typing a number in range calls onValueChange at once; one out of range waits for blur, which clamps it', async () => {
    const calls: Array<number | null> = [];
    await render(<Controlled calls={calls} />);
    await fill('nctl', '3');
    const typed = calls.join();
    await fill('nctl', '9');
    const over = calls.join();
    await blur('nctl');
    expect([typed, over, calls.join(), field('nctl').value]).toEqual(['3', '3', '3,4', '4']);
  });

  test('step 0.25: ArrowUp 1.5 → 1.75, and 2.333 rounds to 2 decimals (2.33); decimal keyboard', async () => {
    await render(<NumberInput id="dec" aria-label="Price" defaultValue={1.5} step={0.25} />);
    field('dec').focus();
    await userEvent.keyboard('{ArrowUp}');
    const up = field('dec').value;
    await fill('dec', '2.333');
    await blur('dec');
    expect([up, field('dec').value, field('dec').inputMode]).toEqual(['1.75', '2.33', 'decimal']);
  });

  test('locale: 1.500 is 1500 in id-ID and 1,500 is 1500 in en-US; "9,5" shows as 9,5 in de-DE and 9.5 in en-US after blur; 1 000 is read in fr-FR', async () => {
    const calls: string[] = [];
    await render(<Col>{(['id-ID', 'en-US', 'de-DE', 'fr-FR'] as const).map((l) => <NumberInput key={l} id={l} aria-label={l} locale={l} step={0.1} onValueChange={(n) => calls.push(l + ' ' + n)} />)}</Col>);
    await fill('id-ID', '1.500'); await blur('id-ID');
    await fill('en-US', '1,500'); await blur('en-US');
    expect([field('id-ID').value, field('en-US').value, field('id-ID').getAttribute('aria-valuenow')]).toEqual(['1500', '1500', '1500']);
    await fill('de-DE', '9.5'); await blur('de-DE');
    await fill('en-US', '9,5'); await blur('en-US');
    await fill('fr-FR', '1 000,5'); await blur('fr-FR');
    expect([field('de-DE').value, field('en-US').value, field('fr-FR').value]).toEqual(['9,5', '9.5', '1000,5']);
    expect(calls.at(-1)).toBe('fr-FR 1000.5');
  });

  test('formatOptions: IDR currency shows "Rp 1.500" with an aria-valuetext, reads "2.000" back, and ArrowUp steps from it; percent shows 15% for 0.15', async () => {
    const calls: Array<number | null> = [];
    await render(<Col>
      <NumberInput id="price" aria-label="Price" locale="id-ID" step={500} defaultValue={1500} formatOptions={{ style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }} onValueChange={(n) => calls.push(n)} />
      <NumberInput id="rate" aria-label="Rate" locale="en-US" step={0.01} defaultValue={0.15} formatOptions={{ style: 'percent' }} onValueChange={(n) => calls.push(n)} />
    </Col>);
    const rp = (t: string) => t.replace(/\s/g, ' ');
    expect(rp(field('price').value)).toBe('Rp 1.500');
    expect(rp(field('price').getAttribute('aria-valuetext')!)).toBe('Rp 1.500');
    await fill('price', '2.000'); await blur('price');
    expect(rp(field('price').value)).toBe('Rp 2.000');
    await userEvent.click(field('price')); await userEvent.keyboard('{ArrowUp}');
    expect(rp(field('price').value)).toBe('Rp 2.500');
    expect(field('rate').value).toBe('15%');
    await fill('rate', '20'); await blur('rate');
    expect([field('rate').value, calls.at(-1)]).toEqual(['20%', 0.2]);
  });

  test('steppers={false}: no buttons', async () => {
    await render(<NumberInput id="bare" aria-label="Bare" steppers={false} />);
    expect(field('bare').parentElement!.querySelector('.dk-number-input__steppers')).toBe(null);
  });

  test('disabled: both buttons disabled, the value doesn\'t change', async () => {
    await render(<NumberInput id="dis" aria-label="Dis" disabled defaultValue={3} />);
    await userEvent.click(plus('dis'), { force: true });
    expect([field('dis').value, steps('dis').every((b) => b.disabled)]).toEqual(['3', true]);
  });

  test('lg: 44px with 20px icons', async () => {
    await render(<NumberInput id="lg" aria-label="Lg" size="lg" defaultValue={1} />);
    const box = field('lg').parentElement!;
    expect([Math.round(box.getBoundingClientRect().height), css(box.querySelector('.dk-number-input__step .dk-icon')).fontSize]).toEqual([44, '20px']);
  });

  test('contrast: the − and + keep 3:1 and the number 4.5:1 on the field in all six themes', async () => {
    await render(<NumberInput id="lg" aria-label="Lg" size="lg" defaultValue={1} />);
    const box = field('lg').parentElement!, low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      // The colors transition into the new theme: read them once that's done.
      await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
      for (const [sel, need] of [['.dk-number-input__step', 3], ['.dk-input__field', 4.5]] as const) {
        const r = contrast(css(box.querySelector(sel)).color, css(box).backgroundColor);
        if (r < need) low.push(`${th} ${sel} ${r.toFixed(2)}`);
      }
    }
    expect(low).toEqual([]);
  });

  test('a button is shaded on hover', async () => {
    await render(<NumberInput id="lg" aria-label="Lg" size="lg" defaultValue={1} />);
    await userEvent.hover(plus('lg'));
    await expect.poll(() => css(plus('lg')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('--number-input-stepper overrides one field', async () => {
    await render(<NumberInput id="tok" aria-label="Tok" style={{ '--number-input-stepper': 'rgb(1, 2, 3)' } as React.CSSProperties} />);
    expect(css(minus('tok')).color).toBe('rgb(1, 2, 3)');
  });
});
