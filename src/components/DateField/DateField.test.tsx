import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Field } from '../Field/Field';
import { DateField, type DateFieldChangeDetails } from './DateField';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const boxes = (root: Element) => [...root.querySelectorAll<HTMLInputElement>('input:not([type=hidden])')];
const box = (name: string) => page.getByRole('textbox', { name }).element() as HTMLInputElement;

describe('DateField', () => {
  test('renders a group <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<DateField id="x" ref={ref} className="extra" data-x="y" aria-label="Date of birth" />);
    const e = el('x');
    expect([e.tagName, e.getAttribute('role'), ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', 'group', true, 'dk-date-field extra', 'y', 'date-field']);
    await expect.element(page.getByRole('group', { name: 'Date of birth' })).toBeInTheDocument();
  });

  test('three labelled numeric boxes, in the locale\'s order: day month year, or month day year in en-US', async () => {
    const { rerender } = await render(<SerupaProvider locale="en-GB"><DateField id="d" aria-label="Date" /></SerupaProvider>);
    const names = () => boxes(el('d')).map((i) => document.querySelector(`label[for="${i.id}"]`)!.textContent);
    expect(names()).toEqual(['Day', 'Month', 'Year']);
    expect(boxes(el('d')).map((i) => [i.inputMode, i.type])).toEqual([['numeric', 'text'], ['numeric', 'text'], ['numeric', 'text']]);
    await userEvent.type(box('Day'), '123');
    await userEvent.type(box('Year'), '202612');
    expect([box('Day').value, box('Year').value]).toEqual(['12', '2026']);
    await rerender(<SerupaProvider locale="en-US"><DateField id="d" aria-label="Date" /></SerupaProvider>);
    expect(names()).toEqual(['Month', 'Day', 'Year']);
    await rerender(<SerupaProvider locale="en-US"><DateField id="d" aria-label="Date" order="ymd" /></SerupaProvider>);
    expect(names()).toEqual(['Year', 'Month', 'Day']);
  });

  test('typing gives YYYY-MM-DD once the boxes make a real date, with what is wrong until then', async () => {
    const seen: [string, DateFieldChangeDetails['problem'], DateFieldChangeDetails['parts']][] = [];
    await render(<SerupaProvider locale="en-GB"><DateField aria-label="Date" onValueChange={(v, d) => seen.push([v, d.problem, d.parts])} /></SerupaProvider>);
    await userEvent.type(box('Day'), '7');
    await userEvent.type(box('Month'), '3');
    await userEvent.type(box('Year'), '2007');
    expect(seen[0]).toEqual(['', 'missing-month', ['month', 'year']]);
    expect(seen[1]).toEqual(['', 'missing-year', ['year']]);
    expect(seen.at(-1)).toEqual(['2007-03-07', null, []]);
    await userEvent.clear(box('Day'));
    await userEvent.type(box('Day'), '31');
    await userEvent.clear(box('Month'));
    await userEvent.type(box('Month'), '4');
    expect(seen.at(-1)).toEqual(['', 'not-a-date', ['day']]);   // 31 April
    await userEvent.clear(box('Month'));
    await userEvent.type(box('Month'), '13');
    expect(seen.at(-1)).toEqual(['', 'not-a-date', ['month']]);
  });

  test('min and max: a date outside them still comes as its value, with before-min or after-max', async () => {
    const onValueChange = vi.fn();
    await render(<SerupaProvider locale="en-GB"><DateField aria-label="Date" min="1900-01-01" max="2026-11-09" onValueChange={onValueChange} /></SerupaProvider>);
    await userEvent.type(box('Day'), '10');
    await userEvent.type(box('Month'), '11');
    await userEvent.type(box('Year'), '2026');
    expect(onValueChange).toHaveBeenLastCalledWith('2026-11-10', expect.objectContaining({ problem: 'after-max', parts: ['day', 'month', 'year'] }));
    await userEvent.clear(box('Year'));
    await userEvent.type(box('Year'), '1899');
    expect(onValueChange).toHaveBeenLastCalledWith('1899-11-10', expect.objectContaining({ problem: 'before-min' }));
  });

  test('a separator typed after a number moves to the next box, and is never typed in', async () => {
    await render(<SerupaProvider locale="en-GB"><DateField aria-label="Date" /></SerupaProvider>);
    await userEvent.click(box('Day'));
    await userEvent.keyboard('/');
    expect([document.activeElement === box('Day'), box('Day').value]).toEqual([true, '']);   // nothing typed yet: stays
    await userEvent.keyboard('7/3.2007');
    expect([box('Day').value, box('Month').value, box('Year').value, document.activeElement === box('Year')]).toEqual(['7', '3', '2007', true]);
  });

  test('a whole date pasted into any box fills all three, in the locale\'s order or as ISO', async () => {
    const onValueChange = vi.fn();
    const paste = async (into: string, text: string) => {
      const src = el('src') as HTMLInputElement;
      src.value = text;
      src.select();
      await userEvent.copy();
      await userEvent.click(box(into));
      await userEvent.paste();
    };
    await render(<SerupaProvider locale="en-GB"><input id="src" aria-label="Source" /><DateField aria-label="Date" onValueChange={onValueChange} /></SerupaProvider>);
    await paste('Month', '17/08/1945');
    expect([box('Day').value, box('Month').value, box('Year').value]).toEqual(['17', '8', '1945']);
    expect(onValueChange).toHaveBeenLastCalledWith('1945-08-17', expect.objectContaining({ reason: 'paste' }));
    await paste('Day', '2007-03-27');
    expect(onValueChange).toHaveBeenLastCalledWith('2007-03-27', expect.objectContaining({ reason: 'paste' }));
    await userEvent.clear(box('Year'));
    await paste('Year', '1999');   // a number alone goes in the box
    expect(box('Year').value).toBe('1999');
  });

  test('digits in other scripts are read as 0–9', async () => {
    const onValueChange = vi.fn();
    await render(<SerupaProvider locale="en-GB"><DateField aria-label="Date" onValueChange={onValueChange} /></SerupaProvider>);
    await userEvent.type(box('Day'), '١٧');
    await userEvent.type(box('Month'), '٨');
    await userEvent.type(box('Year'), '١٩٤٥');
    expect(onValueChange).toHaveBeenLastCalledWith('1945-08-17', expect.objectContaining({ problem: null }));
  });

  test('autoComplete="bday" asks for bday-day, bday-month and bday-year; otherwise off', async () => {
    const { rerender } = await render(<SerupaProvider locale="en-GB"><DateField id="d" aria-label="Date" autoComplete="bday" /></SerupaProvider>);
    expect(boxes(el('d')).map((i) => i.autocomplete)).toEqual(['bday-day', 'bday-month', 'bday-year']);
    await rerender(<SerupaProvider locale="en-GB"><DateField id="d" aria-label="Date" /></SerupaProvider>);
    expect(boxes(el('d')).map((i) => i.autocomplete)).toEqual(['off', 'off', 'off']);
  });

  test('in a Field: the label names the group, the hint and error describe it, and only the wrong box is marked', async () => {
    await render(
      <SerupaProvider locale="en-GB">
        <Field label="Passport expiry" hint="For example, 12 11 2031" error="The expiry date must include a year">
          <DateField defaultValue="" />
        </Field>
      </SerupaProvider>,
    );
    const group = page.getByRole('group', { name: 'Passport expiry' });
    await expect.element(group).toHaveAccessibleDescription('For example, 12 11 2031 The expiry date must include a year');
    expect(group.element().hasAttribute('aria-invalid')).toBe(false);
    expect(boxes(group.element()).map((i) => i.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true']);   // empty: all three
    await userEvent.type(box('Day'), '12');
    await userEvent.type(box('Month'), '11');
    expect(boxes(group.element()).map((i) => i.getAttribute('aria-invalid'))).toEqual([null, null, 'true']);
    await userEvent.click(page.getByText('Passport expiry').element());
    expect(document.activeElement === box('Day')).toBe(true);
  });

  test('controlled: follows value, keeps a part typed so far while value is "", and undoes a date the app refuses', async () => {
    function Demo({ refuse }: { refuse?: boolean }) {
      const [v, setV] = React.useState('2000-01-02');
      return <><DateField aria-label="Date" value={v} onValueChange={(next) => { if (!refuse) setV(next); }} /><button onClick={() => setV('1999-12-31')}>Set</button></>;
    }
    const { rerender } = await render(<SerupaProvider locale="en-GB"><Demo /></SerupaProvider>);
    expect([box('Day').value, box('Month').value, box('Year').value]).toEqual(['2', '1', '2000']);
    await userEvent.clear(box('Year'));
    await userEvent.type(box('Year'), '19');
    expect(box('Year').value).toBe('19');   // value is "" now, and the boxes keep what's typed
    await userEvent.click(page.getByRole('button', { name: 'Set' }));
    expect([box('Day').value, box('Month').value, box('Year').value]).toEqual(['31', '12', '1999']);
    await rerender(<SerupaProvider locale="en-GB"><Demo refuse /></SerupaProvider>);
    await userEvent.clear(box('Day'));
    await userEvent.type(box('Day'), '30');
    expect(box('Day').value).toBe('31');
  });

  test('sends YYYY-MM-DD under its name, "" until it is a date, and form.reset() goes back to defaultValue', async () => {
    await render(<SerupaProvider locale="en-GB"><form id="f"><DateField aria-label="Date" name="dob" defaultValue="1990-05-01" /></form></SerupaProvider>);
    const form = document.getElementById('f') as HTMLFormElement;
    expect(new FormData(form).get('dob')).toBe('1990-05-01');
    await userEvent.clear(box('Day'));
    expect(new FormData(form).get('dob')).toBe('');
    form.reset();
    await expect.poll(() => box('Day').value).toBe('1');
    expect(new FormData(form).get('dob')).toBe('1990-05-01');
  });

  test('disabled: the three boxes are off and nothing is sent', async () => {
    await render(<form id="f"><DateField aria-label="Date" name="dob" defaultValue="1990-05-01" disabled /></form>);
    expect(boxes(document.getElementById('f')!).every((i) => i.disabled)).toBe(true);
    expect(new FormData(document.getElementById('f') as HTMLFormElement).get('dob')).toBe(null);
  });

  test('in Indonesian: Tanggal, Bulan, Tahun', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><DateField aria-label="Tanggal lahir" /></SerupaProvider>);
    for (const n of ['Tanggal', 'Bulan', 'Tahun']) await expect.element(page.getByRole('textbox', { name: n })).toBeInTheDocument();
  });

  test('its labels read 4.5:1 on the surface in all six themes', async () => {
    await render(<div id="s" style={{ background: 'var(--surface)' }}><DateField aria-label="Date" /></div>);
    const label = el('s').querySelector('label')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(label).color, css(el('s')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
