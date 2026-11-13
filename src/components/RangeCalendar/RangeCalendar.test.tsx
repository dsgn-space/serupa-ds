import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Field } from '../Field/Field';
import { RangeCalendar } from './RangeCalendar';

const nov = new Date(2026, 10, 1);
const day = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!;
const status = () => document.querySelector('[data-component="range-calendar"] > p[aria-live]')!.textContent;
type Got = { start: Date; end: Date };
function Stay({ log = [] as [Got, { start: string; end: string }][], ...rest }: { log?: [Got, { start: string; end: string }][] } & Partial<React.ComponentProps<typeof RangeCalendar>>) {
  return <SerupaProvider locale="en-US"><RangeCalendar defaultMonth={nov} onValueChange={(r, iso) => log.push([r, iso])} {...rest} /></SerupaProvider>;
}

let errors: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); document.documentElement.removeAttribute('data-theme'); });

describe('RangeCalendar', () => {
  test('a group named "Choose dates" with a month grid; the ends are selected days named "start date" and "end date", the days between "in the range"; props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Stay ref={ref} id="rc" className="extra" data-x="y" defaultValue={{ start: '2026-11-03', end: '2026-11-05' }} />);
    const e = document.getElementById('rc')!;
    expect([ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual([true, 'dk-range-calendar extra', 'y', 'range-calendar']);
    await expect.element(page.getByRole('group', { name: 'Choose dates' })).toBeVisible();
    await expect.element(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();
    expect([day('2026-11-03'), day('2026-11-04'), day('2026-11-05'), day('2026-11-06')].map((b) => b.getAttribute('aria-label'))).toEqual([
      'Tuesday, November 3, 2026, Start date', 'Wednesday, November 4, 2026, in the range', 'Thursday, November 5, 2026, End date', 'Friday, November 6, 2026']);
    expect([day('2026-11-03').parentElement!.getAttribute('aria-selected'), day('2026-11-04').classList.contains('dk-calendar__day--in-range')]).toEqual(['true', true]);
    expect(status()).toBe('Selected range: Nov 3 – 5, 2026');
  });

  test('in a Field, the Field\'s label names the group, as it names a RadioGroup, and its hint describes it; its own aria-label still wins', async () => {
    await render(<SerupaProvider locale="en-US">
      <Field label="Stay" hint="Up to 14 nights"><RangeCalendar defaultMonth={nov} /></Field>
      <Field label="Leave"><RangeCalendar defaultMonth={nov} aria-label="Annual leave" /></Field>
    </SerupaProvider>);
    await expect.element(page.getByRole('group', { name: 'Stay' })).toHaveAccessibleDescription('Up to 14 nights');
    await expect.element(page.getByRole('group', { name: 'Annual leave' })).toBeVisible();
  });

  test('two presses pick a range in either order; the days between preview under the pointer; the value changes only when both are picked', async () => {
    const log: [Got, { start: string; end: string }][] = [];
    await render(<Stay log={log} />);
    expect(status()).toBe('Choose the start date');
    await userEvent.click(day('2026-11-10'));
    expect(status()).toBe('Choose the end date');
    await userEvent.hover(day('2026-11-07'));
    expect(day('2026-11-08').classList.contains('dk-calendar__day--in-range')).toBe(true);
    expect(log).toEqual([]);
    await userEvent.click(day('2026-11-07'));
    expect(log.map(([, iso]) => iso)).toEqual([{ start: '2026-11-07', end: '2026-11-10' }]);
    expect(log[0]![0].start).toEqual(new Date(2026, 10, 7));
    expect(status()).toBe('Selected range: Nov 7 – 10, 2026');
    await userEvent.click(day('2026-11-20'));
    await userEvent.click(day('2026-11-20'));
    expect(log.at(-1)![1]).toEqual({ start: '2026-11-20', end: '2026-11-20' });
    expect(day('2026-11-20').getAttribute('aria-label')).toBe('Friday, November 20, 2026, Start date, End date');
  });

  test('with keys: Enter picks, the arrows preview the range, Escape drops a half-picked range and goes no further', async () => {
    const log: [Got, { start: string; end: string }][] = [], outer = vi.fn();
    await render(<div onKeyDown={(e) => { if (e.key === 'Escape') outer(); }}><Stay log={log} defaultValue={{ start: '2026-11-03', end: '2026-11-05' }} /></div>);
    day('2026-11-03').focus();
    await userEvent.keyboard('{ArrowRight}{Enter}{ArrowRight}{ArrowRight}');
    expect(day('2026-11-05').getAttribute('aria-label')).toBe('Thursday, November 5, 2026, in the range');
    await userEvent.keyboard('{Escape}');
    expect(outer).not.toHaveBeenCalled();
    expect(status()).toBe('Selected range: Nov 3 – 5, 2026');
    expect(day('2026-11-06').getAttribute('aria-label')).toBe('Friday, November 6, 2026');
    await userEvent.keyboard('{Escape}');
    expect(outer).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}{ArrowDown}{Enter}');
    expect(log.map(([, iso]) => iso)).toEqual([{ start: '2026-11-06', end: '2026-11-13' }]);
  });

  test('the rest of the keys: Tab reaches the start day, Up a week back, Home and End the week’s ends, Page Down and Page Up a month on and back, Space picks', async () => {
    const log: [Got, { start: string; end: string }][] = [];
    await render(<SerupaProvider locale="en-US"><button type="button">Before</button><RangeCalendar defaultMonth={nov} weekStartsOn={0} defaultValue={{ start: '2026-11-11', end: '2026-11-12' }} onValueChange={(r, iso) => log.push([r, iso])} /></SerupaProvider>);
    page.getByRole('button', { name: 'Before' }).element().focus();
    await userEvent.keyboard('{Tab}{Tab}{Tab}');
    expect(document.activeElement).toBe(day('2026-11-11'));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(day('2026-11-04'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(day('2026-11-01'));
    await userEvent.keyboard('{End} ');
    expect(document.activeElement).toBe(day('2026-11-07'));
    await userEvent.keyboard('{PageDown}{PageDown}{PageUp}');
    expect(document.activeElement).toBe(day('2026-12-07'));
    await userEvent.keyboard(' ');
    expect(log.map(([, iso]) => iso)).toEqual([{ start: '2026-11-07', end: '2026-12-07' }]);
  });

  test('controlled: shows what it is given; leaving the days puts the preview back on the one end picked', async () => {
    const log: [Got, { start: string; end: string }][] = [];
    await render(<Stay log={log} value={{ start: '2026-11-03', end: '2026-11-05' }} />);
    await userEvent.click(day('2026-11-16'));
    await userEvent.hover(day('2026-11-19'));
    expect(day('2026-11-18').classList.contains('dk-calendar__day--in-range')).toBe(true);
    await userEvent.hover(page.getByText('Choose the end date'));
    await userEvent.unhover(day('2026-11-19'));
    expect(day('2026-11-18').classList.contains('dk-calendar__day--in-range')).toBe(false);
    await userEvent.click(day('2026-11-17'));
    expect(log.length).toBe(1);
    expect(day('2026-11-04').classList.contains('dk-calendar__day--in-range')).toBe(true);
  });

  test('two months: the range runs across both, the first turns back and the second forward, and one pair moves both', async () => {
    const months: Date[] = [];
    await render(<Stay months={2} defaultValue={{ start: '2026-11-28', end: '2026-12-02' }} onMonthChange={(m) => months.push(m)} />);
    expect(page.getByRole('grid').elements().map((g) => g.getAttribute('aria-labelledby') && document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent)).toEqual(['November 2026', 'December 2026']);
    expect(day('2026-12-01').classList.contains('dk-calendar__day--in-range')).toBe(true);
    await userEvent.click(page.getByRole('button', { name: 'Next month' }).last());
    expect(months).toEqual([new Date(2026, 11, 1)]);
    await expect.element(page.getByRole('grid', { name: 'January 2027' })).toBeVisible();
  });

  test('a disabled day can’t be an end but can sit inside; min and max hold too', async () => {
    const log: [Got, { start: string; end: string }][] = [];
    await render(<Stay log={log} min="2026-11-02" isDateDisabled={(d) => d.getDate() === 12} />);
    day('2026-11-12').click();   // a disabled day (aria-disabled) takes the press but picks nothing
    day('2026-11-01').click();
    expect(status()).toBe('Choose the start date');
    await userEvent.click(day('2026-11-10'));
    await userEvent.click(day('2026-11-14'));
    expect(log.map(([, iso]) => iso)).toEqual([{ start: '2026-11-10', end: '2026-11-14' }]);
    expect(day('2026-11-12').getAttribute('aria-label')).toBe('Thursday, November 12, 2026, in the range');
  });

  test('with no value or month it opens on today’s month, or on min’s or max’s when today is outside them', async () => {
    const today = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    const { unmount } = await render(<Stay defaultMonth={undefined} />);
    await expect.element(page.getByRole('grid', { name: today })).toBeVisible();
    await unmount();
    const before = await render(<Stay defaultMonth={undefined} max="2020-03-10" />);
    await expect.element(page.getByRole('grid', { name: 'March 2020' })).toBeVisible();
    await before.unmount();
    await render(<Stay defaultMonth={undefined} min="2099-05-02" />);
    await expect.element(page.getByRole('grid', { name: 'May 2099' })).toBeVisible();
  });

  test('autoFocus focuses the start day', async () => {
    await render(<Stay autoFocus defaultValue={{ start: '2026-11-09', end: '2026-11-11' }} />);
    await expect.poll(() => document.activeElement).toBe(day('2026-11-09'));
  });

  test('Indonesian: the words and the range as Indonesian writes it', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><RangeCalendar defaultMonth={nov} defaultValue={{ start: '2026-11-03', end: '2026-11-05' }} /></SerupaProvider>);
    await expect.element(page.getByRole('group', { name: 'Pilih rentang tanggal' })).toBeVisible();
    expect(status()).toBe('Rentang terpilih: ' + new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).formatRange(new Date(2026, 10, 3), new Date(2026, 10, 5)).replace(/[\u2009\u202f]/g, ' '));
    expect(day('2026-11-04').getAttribute('aria-label')).toMatch(/, dalam rentang$/);
  });

  test('the ends, the days between and the status line read 4.5:1 in all six themes', async () => {
    await render(<Stay defaultValue={{ start: '2026-11-03', end: '2026-11-05' }} />);
    const line = document.querySelector<HTMLElement>('[data-component="range-calendar"] > p[aria-live]')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const iso of ['2026-11-03', '2026-11-04']) expect(contrast(css(day(iso)).color, css(day(iso)).backgroundColor), `${th} ${iso}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(line).color, css(document.body).backgroundColor), th + ' status').toBeGreaterThanOrEqual(4.5);
    }
  });
});
