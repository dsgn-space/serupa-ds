import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { css, lowContrast, settle } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { PeriodPicker, periodIndex, periodValue } from './PeriodPicker';

// The tests that read names say they mean en-US: with no locale, digits and month names are the browser's.
const EnUS = ({ children }: { children: React.ReactNode }) => <SerupaProvider locale="en-US">{children}</SerupaProvider>;
const button = () => document.querySelector<HTMLButtonElement>('[role=combobox]')!;
const panel = () => document.querySelector<HTMLElement>('[role=dialog]')!;
const periods = () => [...panel().querySelectorAll<HTMLButtonElement>('[role=gridcell] button')];
// The focused period's name, from its hidden full name (the visible short one is aria-hidden), or a button's label.
const focused = () => document.activeElement?.querySelector('span:not([aria-hidden])')?.textContent ?? document.activeElement?.getAttribute('aria-label');
const shown = (e: Element) => [...e.querySelectorAll('[aria-hidden]')].map((x) => x.textContent).join('');
// performance.now: Date is held at 12 March 2025 (the stories' clock), so it doesn't move.
const until = async (ok: () => boolean, ms = 2000) => { const end = performance.now() + ms; while (!ok() && performance.now() < end) await settle(20); expect(ok()).toBe(true); };

let errors: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); vi.useFakeTimers({ toFake: ['Date'], now: new Date(2025, 2, 12, 10) }); });
afterEach(() => { vi.useRealTimers(); expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); document.documentElement.removeAttribute('data-theme'); });

describe('PeriodPicker', () => {
  test('a combobox button (aria-haspopup dialog, collapsed) with the placeholder, md 32px with a 1px field border and 6px corners; ref, className, data and aria props reach it', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    await render(<EnUS><PeriodPicker ref={ref} aria-label="Report month" className="extra" data-x="y" /></EnUS>);
    const b = button(), root = b.parentElement!;
    expect([b.tagName, b.getAttribute('role'), b.getAttribute('aria-haspopup'), b.getAttribute('aria-expanded'), b.getAttribute('aria-label'), b.dataset.x, ref.current === b]).toEqual(['BUTTON', 'combobox', 'dialog', 'false', 'Report month', 'y', true]);
    expect([root.dataset.component, root.dataset.unit, root.className]).toEqual(['period-picker', 'month', 'dk-period-picker dk-period-picker--size-md extra']);
    expect(b.textContent).toBe('Choose a month');
    expect([css(b).height, css(b).borderTopWidth, css(b).borderRadius]).toEqual(['32px', '1px', '6px']);
  });

  test('a value reads in words: "November 2026", "Q4 2026", "2026"; sm and lg are 24 and 44px; a bad value shows the placeholder', async () => {
    await render(<EnUS>
      <PeriodPicker aria-label="A" defaultValue="2026-11" />
      <PeriodPicker aria-label="B" unit="quarter" defaultValue="2026-Q4" size="sm" />
      <PeriodPicker aria-label="C" unit="year" defaultValue="2026" size="lg" />
      <PeriodPicker aria-label="D" unit="quarter" defaultValue="2026-11" />
    </EnUS>);
    const bs = [...document.querySelectorAll<HTMLButtonElement>('[role=combobox]')];
    expect(bs.map((b) => b.textContent)).toEqual(['November 2026', 'Q4 2026', '2026', 'Choose a quarter']);
    expect([css(bs[1]).height, css(bs[2]).height]).toEqual(['24px', '44px']);
  });

  test('values are written "yyyy-mm", "yyyy-Qn" and "yyyy"; anything else for the unit is no value', () => {
    expect([periodIndex('2026-11', 'month'), periodIndex('2026-Q4', 'quarter'), periodIndex('2026', 'year'), periodIndex(' 0099-01 ', 'month')]).toEqual([2026 * 12 + 10, 2026 * 4 + 3, 2026, 99 * 12]);
    expect([periodIndex('2026-13', 'month'), periodIndex('2026-Q5', 'quarter'), periodIndex('2026-Q1', 'month'), periodIndex('2026-01', 'quarter'), periodIndex('2026-01', 'year'), periodIndex(null, 'year'), periodIndex('Nov 2026', 'month')]).toEqual([null, null, null, null, null, null, null]);
    expect([periodValue(2026 * 12 + 10, 'month'), periodValue(2026 * 4 + 3, 'quarter'), periodValue(2026, 'year'), periodValue(99 * 12, 'month')]).toEqual(['2026-11', '2026-Q4', '2026', '0099-01']);
  });

  test('a click opens a dialog named "Choose a month": the year between its arrows, 12 months in rows of 3, focus on the chosen one; this month is aria-current', async () => {
    await render(<EnUS><PeriodPicker aria-label="Report month" defaultValue="2025-02" /></EnUS>);
    await userEvent.click(button());
    expect([button().getAttribute('aria-expanded'), panel().getAttribute('aria-label'), button().getAttribute('aria-controls')]).toEqual(['true', 'Choose a month', panel().id]);
    expect(panel().querySelector('h2')!.textContent).toBe('2025');
    expect([...panel().querySelectorAll('tr')].map(shown)).toEqual(['JanFebMar', 'AprMayJun', 'JulAugSep', 'OctNovDec']);
    await until(() => focused() === 'February 2025');
    const feb = periods()[1], mar = periods()[2];
    expect([feb.parentElement!.getAttribute('aria-selected'), feb.tabIndex, mar.getAttribute('aria-current'), periods().filter((p) => p.tabIndex === 0).length]).toEqual(['true', 0, 'date', 1]);
    expect(feb.className).toContain('dk-period-picker__period--selected');
  });

  test('picking a month calls onValueChange with "2025-05" and its first and last days, closes, and focus goes back to the button', async () => {
    const changed = vi.fn();
    await render(<EnUS><form id="f"><PeriodPicker aria-label="Report month" name="month" onValueChange={changed} /></form></EnUS>);
    await userEvent.click(button());
    await until(() => focused() === 'March 2025');
    await userEvent.click(page.getByRole('button', { name: 'May 2025' }));
    expect(changed).toHaveBeenCalledWith('2025-05', { start: new Date(2025, 4, 1), end: new Date(2025, 4, 31) });
    expect([button().getAttribute('aria-expanded'), button().textContent, document.activeElement === button()]).toEqual(['false', 'May 2025', true]);
    expect(new FormData(document.getElementById('f') as HTMLFormElement).get('month')).toBe('2025-05');
  });

  test('keys: arrows move one or a row, Home and End the row\'s ends, PageUp and PageDown a year, past the page shows the next; Enter picks', async () => {
    const changed = vi.fn();
    await render(<EnUS><PeriodPicker aria-label="Report month" defaultValue="2025-05" onValueChange={changed} /></EnUS>);
    button().focus();
    await userEvent.keyboard('{ArrowDown}');
    await until(() => focused() === 'May 2025');
    const seq: Array<[string, string]> = [['{ArrowRight}', 'June 2025'], ['{ArrowDown}', 'September 2025'], ['{ArrowLeft}', 'August 2025'], ['{ArrowUp}', 'May 2025'],
      ['{Home}', 'April 2025'], ['{End}', 'June 2025'], ['{PageUp}', 'June 2024'], ['{PageDown}', 'June 2025'], ['{ArrowDown}', 'September 2025'], ['{ArrowDown}', 'December 2025'], ['{ArrowRight}', 'January 2026']];
    for (const [k, want] of seq) { await userEvent.keyboard(k); await until(() => focused() === want); }
    expect(panel().querySelector('h2')!.textContent).toBe('2026');
    await userEvent.keyboard('{Enter}');
    expect(changed).toHaveBeenCalledWith('2026-01', { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) });
  });

  test('right to left, ArrowLeft goes to the next month', async () => {
    await render(<EnUS><div dir="rtl"><PeriodPicker aria-label="Report month" defaultValue="2025-05" defaultOpen /></div></EnUS>);
    periods()[4].focus();
    await userEvent.keyboard('{ArrowLeft}');
    await until(() => focused() === 'June 2025');
    expect(button().getAttribute('aria-expanded')).toBe('true');
  });

  test('Escape closes it without a change and focus goes back to the button, from the grid and from an arrow', async () => {
    const changed = vi.fn();
    await render(<EnUS><PeriodPicker aria-label="Report month" defaultValue="2025-05" onValueChange={changed} /></EnUS>);
    await userEvent.click(button());
    await until(() => focused() === 'May 2025');
    await userEvent.keyboard('{ArrowRight}{Escape}');
    expect([button().getAttribute('aria-expanded'), document.activeElement === button(), button().textContent]).toEqual(['false', true, 'May 2025']);
    await userEvent.click(button());
    await until(() => focused() === 'May 2025');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Shift>}{Tab}{/Shift}');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Previous year');
    await userEvent.keyboard('{Escape}');
    expect([button().getAttribute('aria-expanded'), document.activeElement === button(), changed.mock.calls.length]).toEqual(['false', true, 0]);
  });

  test('the arrows page a year; a press outside closes it', async () => {
    await render(<EnUS><button type="button">Elsewhere</button><PeriodPicker aria-label="Report month" defaultValue="2025-05" /></EnUS>);
    await userEvent.click(button());
    await userEvent.click(page.getByRole('button', { name: 'Next year' }));
    expect(panel().querySelector('h2')!.textContent).toBe('2026');
    await userEvent.click(page.getByRole('button', { name: 'Previous year' }));
    await userEvent.click(page.getByRole('button', { name: 'Previous year' }));
    expect(panel().querySelector('h2')!.textContent).toBe('2024');
    await userEvent.click(page.getByRole('button', { name: 'Elsewhere' }));
    await until(() => button().getAttribute('aria-expanded') === 'false');
  });

  test('quarters: four in rows of two, "Q1" to "Q4", named with the year; picking gives the quarter\'s three months', async () => {
    const changed = vi.fn();
    await render(<EnUS><PeriodPicker aria-label="Quarter" unit="quarter" onValueChange={changed} /></EnUS>);
    await userEvent.click(button());
    expect([...panel().querySelectorAll('tr')].map(shown)).toEqual(['Q1Q2', 'Q3Q4']);
    await until(() => focused() === 'Q1 2025');
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await until(() => focused() === 'Q4 2025');
    await userEvent.keyboard('{ArrowRight}');
    await until(() => focused() === 'Q1 2026');
    // Space chooses, as Enter does.
    await userEvent.keyboard(' ');
    expect(changed).toHaveBeenCalledWith('2026-Q1', { start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) });
    expect(button().textContent).toBe('Q1 2026');
  });

  test('years: twelve to a page (2016 to 2027), the arrows page twelve years', async () => {
    const changed = vi.fn();
    await render(<EnUS><PeriodPicker aria-label="Fiscal year" unit="year" defaultValue="2023" onValueChange={changed} /></EnUS>);
    await userEvent.click(button());
    expect([panel().getAttribute('aria-label'), panel().querySelector('h2')!.textContent, shown(periods()[0]), shown(periods()[11])]).toEqual(['Choose a year', '2016–2027', '2016', '2027']);
    await userEvent.click(page.getByRole('button', { name: 'Next 12 years' }));
    expect(panel().querySelector('h2')!.textContent).toBe('2028–2039');
    await userEvent.click(page.getByRole('button', { name: '2030' }));
    expect(changed).toHaveBeenCalledWith('2030', { start: new Date(2030, 0, 1), end: new Date(2030, 11, 31) });
  });

  test('min and max: periods outside are aria-disabled and do nothing, keys stop at them, and an arrow with nothing past it is disabled', async () => {
    const changed = vi.fn();
    await render(<EnUS><PeriodPicker aria-label="Billing month" min="2024-06" max="2025-03" defaultValue="2025-01" onValueChange={changed} /></EnUS>);
    await userEvent.click(button());
    await until(() => focused() === 'January 2025');
    expect(periods().filter((p) => p.getAttribute('aria-disabled') === 'true').map(shown)).toEqual(['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    expect([page.getByRole('button', { name: 'Next year' }).element().hasAttribute('disabled'), page.getByRole('button', { name: 'Previous year' }).element().hasAttribute('disabled')]).toEqual([true, false]);
    periods()[4].click();   // aria-disabled: Playwright won't press it, a pointer still can
    await settle(50);
    expect([changed.mock.calls.length, button().getAttribute('aria-expanded')]).toEqual([0, 'true']);
    await userEvent.keyboard('{PageDown}');
    await until(() => focused() === 'March 2025');
    await userEvent.keyboard('{PageUp}{PageUp}');
    await until(() => focused() === 'June 2024');
  });

  test('an arrow that pages to the end is disabled, and focus moves to the other arrow rather than being lost', async () => {
    await render(<EnUS><PeriodPicker aria-label="Billing month" min="2024-06" max="2025-03" defaultValue="2025-01" /></EnUS>);
    await userEvent.click(button());
    await until(() => focused() === 'January 2025');
    const prev = page.getByRole('button', { name: 'Previous year' }), next = page.getByRole('button', { name: 'Next year' });
    await userEvent.click(prev);
    await expect.element(prev).toBeDisabled();
    await expect.element(next).toHaveFocus();
    await userEvent.click(next);
    await expect.element(next).toBeDisabled();
    await expect.element(prev).toHaveFocus();
  });

  test('controlled: shows the value it is given, and a pick only asks', async () => {
    const changed = vi.fn();
    function Ctl() { const [v, setV] = React.useState<string | null>('2025-01'); return <><PeriodPicker aria-label="M" value={v} onValueChange={(x) => { changed(x); }} /><button type="button" onClick={() => setV('2024-12')}>Set</button></>; }
    await render(<EnUS><Ctl /></EnUS>);
    await userEvent.click(button());
    await userEvent.click(page.getByRole('button', { name: 'June 2025' }));
    expect([changed.mock.calls[0][0], button().textContent]).toEqual(['2025-06', 'January 2025']);
    await userEvent.click(page.getByRole('button', { name: 'Set' }));
    expect(button().textContent).toBe('December 2024');
  });

  test('read-only and disabled don\'t open; read-only still sends its value with a form, disabled doesn\'t', async () => {
    await render(<EnUS><form id="f">
      <PeriodPicker aria-label="R" name="r" readOnly defaultValue="2025-03" />
      <PeriodPicker aria-label="D" name="d" disabled defaultValue="2025-03" />
    </form></EnUS>);
    const [r, d] = [...document.querySelectorAll<HTMLButtonElement>('[role=combobox]')];
    await userEvent.click(r);
    r.focus(); await userEvent.keyboard('{ArrowDown}');
    expect([r.getAttribute('aria-expanded'), r.getAttribute('aria-readonly'), d.disabled]).toEqual(['false', 'true', true]);
    const data = new FormData(document.getElementById('f') as HTMLFormElement);
    expect([data.get('r'), data.get('d')]).toEqual(['2025-03', null]);
  });

  test('a form reset puts back the first value', async () => {
    await render(<EnUS><form id="f"><PeriodPicker aria-label="M" name="m" defaultValue="2025-01" /><button type="reset">Reset</button></form></EnUS>);
    await userEvent.click(button());
    await userEvent.click(page.getByRole('button', { name: 'April 2025' }));
    expect(button().textContent).toBe('April 2025');
    await userEvent.click(page.getByRole('button', { name: 'Reset' }));
    await until(() => button().textContent === 'January 2025');
  });

  test('in a Field: its label names the button, and its error sets aria-invalid and the danger outline', async () => {
    await render(<EnUS><Field label="Billing month" error="Choose a month."><PeriodPicker /></Field></EnUS>);
    await expect.element(page.getByRole('combobox', { name: 'Billing month' })).toHaveAttribute('aria-invalid', 'true');
    expect(button().parentElement!.className).toContain('dk-period-picker--invalid');
  });

  test('in the locale: German month names, Indonesian words and quarters, Eastern Arabic digits in ar-EG', async () => {
    await render(<>
      <PeriodPicker aria-label="A" locale="de-DE" defaultValue="2025-12" />
      <SerupaProvider locale="id-ID" labels={idLabels}><PeriodPicker aria-label="B" unit="quarter" defaultValue="2025-Q3" /><PeriodPicker aria-label="C" unit="year" /></SerupaProvider>
      <PeriodPicker aria-label="D" locale="ar-EG" unit="year" defaultValue="2025" />
    </>);
    const bs = [...document.querySelectorAll<HTMLButtonElement>('[role=combobox]')];
    expect(bs.map((b) => b.textContent)).toEqual(['Dezember 2025', 'K3 2025', 'Pilih tahun', '٢٠٢٥']);
    expect(bs[0].getAttribute('lang')).toBe('de-DE');
  });

  test('contrast in all six themes: text and placeholder 4.5:1 on the field, icon and border 3:1; periods and the title 4.5:1 on the popup, the chosen one on primary, this one in primary', () => {
    expect(lowContrast([
      ['text', 'var(--text)', 'var(--field)', 4.5],
      ['placeholder', 'var(--placeholder)', 'var(--field)', 4.5],
      ['icon', 'var(--text-muted)', 'var(--field)', 3],
      ['border', 'var(--field-border)', 'var(--surface)', 3],
      ['period', 'var(--text)', 'var(--surface-overlay)', 4.5],
      ['hovered', 'var(--text)', 'var(--surface-muted)', 4.5],
      ['selected', 'var(--on-primary)', 'var(--primary)', 4.5],
      ['current', 'var(--primary)', 'var(--surface-overlay)', 4.5],
      ['focus', 'var(--focus-ring)', 'var(--surface-overlay)', 3],
    ])).toEqual([]);
  });
});
