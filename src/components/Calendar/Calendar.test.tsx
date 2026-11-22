import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, forcedColors, iconPoints, press, disabledLook } from '../../../tools/test/vitest/helpers';
import { Calendar, type CalendarProps } from './Calendar';

const q = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const cal = <T extends HTMLElement = HTMLElement>(sel: string) => q<T>(`[data-testid=cal] ${sel}`);
const focused = () => { const a = document.activeElement as HTMLElement; return a.dataset.date || a.id || a.tagName; };
const title = () => cal('.srp-calendar__title').textContent;

// The script's main calendar: March 2025, Sunday weeks, min Feb 3, max Jun 20, March Sundays refused.
function Cal(props: { picks?: string[]; months?: string[]; cref?: React.Ref<HTMLDivElement> } & Partial<CalendarProps>) {
  const { picks = [], months = [], cref, ...rest } = props;
  return <Calendar data-testid="cal" locale="en-US" weekStartsOn={0} defaultMonth={new Date(2025, 2, 10)} defaultValue={new Date(2025, 2, 10)} className="extra" ref={cref}
    min={new Date(2025, 1, 3)} max={new Date(2025, 5, 20)} isDateDisabled={(d) => d.getDay() === 0 && d.getMonth() === 2}
    onValueChange={(d) => { picks.push(d.toDateString()); }} onMonthChange={(m) => { months.push(m.toDateString()); }} {...rest} />;
}

const modified = (t: Element, key = 'ArrowRight') => ['altKey', 'ctrlKey', 'metaKey'].map((m) => { const ev = new KeyboardEvent('keydown', { key, [m]: true, bubbles: true, cancelable: true }); t.dispatchEvent(ev); return ev.defaultPrevented; });

describe('Calendar', () => {
  test('a weekStartsOn that is NaN or Infinity is none: the locale\'s first day leads, where the grid broke with "Invalid time value"', async () => {
    await render(<div><Calendar data-testid="nan" locale="en-GB" weekStartsOn={NaN} defaultMonth={new Date(2025, 2, 10)} /><Calendar data-testid="inf" locale="en-US" weekStartsOn={Infinity} defaultMonth={new Date(2025, 2, 10)} /></div>);
    const first = (id: string) => page.getByTestId(id).element().querySelector('th[abbr]')?.getAttribute('abbr');
    expect([first('nan'), first('inf')]).toEqual(['Monday', 'Sunday']);
  });

  test('weekNumbers: a column of ISO week numbers before the days, each its row\'s header ("Week 9"); arrows still move by day; it fits a 320px screen', async () => {
    await render(<Cal weekNumbers />);
    const rows = [...document.querySelectorAll('[data-testid=cal] tbody tr')];
    const heads = rows.map((tr) => tr.querySelector('th[scope="row"]')!.textContent);
    // March 2025 in Sunday weeks: Sun Feb 23 starts the first row, whose Thursday (Feb 27) is in ISO week 9.
    expect(heads).toEqual(['Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14']);
    expect(rows.map((tr) => tr.querySelectorAll('td').length)).toEqual([7, 7, 7, 7, 7, 7]);
    const colHead = cal('thead th');
    expect([colHead.getAttribute('scope'), colHead.textContent, colHead.querySelector('[aria-hidden]')!.textContent]).toEqual(['col', 'WkWeek', 'Wk']);
    cal('[data-date="2025-03-10"]').focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused()).toBe('2025-03-08');
    await page.viewport(320, 640);
    try {
      expect(cal('.srp-calendar__grid').getBoundingClientRect().width).toBeLessThanOrEqual(320 - 32);
    } finally { await page.viewport(1280, 800); }
  });

  test('isoWeek: the week of the year\'s first Thursday is week 1, so 1 Jan can be week 1, 53 or 52', async () => {
    const { isoWeek } = await import('./Calendar');
    expect([isoWeek(new Date(2026, 0, 1)), isoWeek(new Date(2021, 0, 1)), isoWeek(new Date(2023, 0, 1)), isoWeek(new Date(2024, 11, 30)), isoWeek(new Date(2026, 5, 15))]).toEqual([1, 53, 52, 1, 25]);
  });

  test('a parent that renders again with the same props doesn\'t draw the 42 days again; a new value draws them', async () => {
    // isDateDisabled is asked once a day drawn: counting the calls counts the days drawn.
    const isDateDisabled = vi.fn((d: Date) => d.getDay() === 0);
    const month = new Date(2026, 10, 1);
    const r = await render(<Calendar month={month} value="2026-11-10" isDateDisabled={isDateDisabled} locale="en-US" />);
    isDateDisabled.mockClear();
    await r.rerender(<Calendar month={month} value="2026-11-10" isDateDisabled={isDateDisabled} locale="en-US" />);
    expect(isDateDisabled).not.toHaveBeenCalled();
    await r.rerender(<Calendar month={month} value="2026-11-12" isDateDisabled={isDateDisabled} locale="en-US" />);
    expect(isDateDisabled).toHaveBeenCalledTimes(42);
    expect(document.querySelector('[aria-selected="true"] button')!.getAttribute('data-date')).toBe('2026-11-12');
  });

  test('pairedNav (two months side by side) hides the month button the other month shows, on a wide screen only', async () => {
    await page.viewport(900, 700);
    await render(<div><Calendar id="a" defaultMonth={new Date(2026, 10, 1)} pairedNav="next" /><Calendar id="b" defaultMonth={new Date(2026, 11, 1)} pairedNav="previous" /></div>);
    const seen = () => ['a', 'b'].map((id) => Array.from(document.querySelectorAll(`#${id} button[aria-label$="month"]`)).map((b) => css(b).visibility));
    expect(seen()).toEqual([['visible', 'hidden'], ['hidden', 'visible']]);
    await page.viewport(400, 700);
    expect(seen()).toEqual([['visible', 'visible'], ['visible', 'visible']]);
  });

  test('with Alt, Ctrl or ⌘ the arrow keys are left to the browser (Alt+← goes back a page) (L8E28)', async () => {
    await render(<Calendar data-testid="mk" locale="en-US" defaultMonth={new Date(2025, 2, 1)} />);
    const t = document.querySelector('[data-testid=mk] [tabindex="0"]') as HTMLElement;
    t.focus();
    const before = t.textContent;
    expect([modified(t), modified(t, 'ArrowLeft'), document.activeElement === t, t.textContent === before]).toEqual([[false, false, false], [false, false, false], true, true]);
  });

  test('plain "yyyy-mm-dd" strings: value, min and max take them as those local days, and onValueChange also gets the day as "yyyy-mm-dd"', async () => {
    const picks: string[] = [];
    await render(<div data-testid="cal"><Calendar value="2026-10-14" min="2026-10-10" max="2026-10-20" onValueChange={(d, iso) => picks.push(d.getHours() + ':' + d.getDate() + ' ' + iso.iso)} /></div>);
    expect([cal<HTMLElement>('[aria-selected="true"] [data-date]').dataset.date, cal('[data-date="2026-10-09"]').getAttribute('aria-disabled'), cal('[data-date="2026-10-21"]').getAttribute('aria-disabled')]).toEqual(['2026-10-14', 'true', 'true']);
    cal<HTMLElement>('[data-date="2026-10-16"]').click();
    expect(picks).toEqual(['0:16 2026-10-16']);
  });

  test('a grid named by the "March 2025" title (aria-live), six weeks of 7 days from Sun Feb 23, weekday headers with full names, one Tab stop on the selected day; ref and className', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Cal cref={ref} />);
    const el = q('[data-testid=cal]'), grid = el.querySelector('[role=grid]')!, t = el.querySelector('h2')!;
    expect(ref.current).toBe(el);
    expect(el.className).toMatch(/extra/);
    expect([t.textContent, t.getAttribute('aria-live'), document.getElementById(grid.getAttribute('aria-labelledby')!)!.textContent]).toEqual(['March 2025', 'polite', 'March 2025']);
    expect([grid.querySelectorAll('tbody tr').length, grid.querySelectorAll('tbody button').length]).toEqual([6, 42]);
    // Short names are shown, full ones are what screen readers read (the short span is hidden from them).
    expect([...grid.querySelectorAll('th [aria-hidden]')].map((x) => x.textContent).join()).toBe('Sun,Mon,Tue,Wed,Thu,Fri,Sat');
    expect([...grid.querySelectorAll('th > span:not([aria-hidden])')].map((x) => x.textContent).join()).toBe('Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday');
    expect([grid.querySelector('th')!.getAttribute('abbr'), css(grid.querySelector('th > span:not([aria-hidden])')).position]).toEqual(['Sunday', 'absolute']);
    expect(grid.querySelector<HTMLElement>('tbody button')!.dataset.date).toBe('2025-02-23');
    expect([...grid.querySelectorAll<HTMLElement>('button[tabindex="0"]')].map((x) => x.dataset.date).join()).toBe('2025-03-10');
    expect(grid.querySelector('[data-date="2025-02-23"]')!.className).toMatch(/outside/);
  });

  test('each day is named by its full date and the chosen one is aria-selected', async () => {
    await render(<Cal />);
    const d = cal('[data-date="2025-03-10"]');
    expect([d.getAttribute('aria-label'), d.parentElement!.getAttribute('aria-selected')]).toEqual(['Monday, March 10, 2025', 'true']);
  });

  test('forced colors: the selected day is Highlight with HighlightText, kept as is (no backplate hides the number)', async () => {
    await render(<Cal />);
    const d = cal('[data-date="2025-03-10"]'), other = cal('[data-date="2025-03-11"]');
    const r = await forcedColors((active) => active && [css(d).forcedColorAdjust, css(other).forcedColorAdjust, css(d).color !== css(d).backgroundColor]);
    if (r) expect(r).toEqual(['none', 'auto', true]);
  });

  test('right to left: the previous-month chevron points right and the next one left', async () => {
    await render(<div dir="rtl"><Calendar data-testid="cal" defaultValue={new Date(2025, 2, 15)} /></div>);
    expect([cal('.srp-calendar__nav--prev [data-icon]'), cal('.srp-calendar__nav--next [data-icon]')].map(iconPoints)).toEqual(['right', 'left']);
  });

  test('de-DE: German names and weeks starting on Monday', async () => {
    await render(<Calendar data-testid="de" locale="de-DE" defaultMonth={new Date(2025, 2, 1)} />);
    const de = [...document.querySelectorAll('[data-testid=de] th [aria-hidden]')].map((x) => x.textContent).join() + ' ' + q('[data-testid=de] .srp-calendar__title').textContent;
    expect(de).toMatch(/^Mo\.?,Di\.?,Mi\.?,Do\.?,Fr\.?,Sa\.?,So\.? März 2025$/);
  });

  test('th, fa, ja-u-ca-japanese, ar-EG: the title and day labels name the Gregorian month shown in the grid, with localized month names', async () => {
    await render(<>{['th', 'fa', 'ja-u-ca-japanese', 'ar-EG'].map((l) => <Calendar key={l} data-testid={l} locale={l} defaultMonth={new Date(2025, 10, 1)} />)}</>);
    for (const l of ['th', 'fa', 'ja-u-ca-japanese', 'ar-EG']) {
      const t = q(`[data-testid="${l}"] .srp-calendar__title`).textContent;
      const label = q(`[data-testid="${l}"] [data-date="2025-11-22"]`).getAttribute('aria-label')!;
      expect(t, l).toContain('2025');
      expect(t, l).toContain(new Intl.DateTimeFormat(l, { calendar: 'gregory', month: 'long' }).format(new Date(2025, 10, 1)));
      expect(label, l).toMatch(/22.*2025|2025.*22/);
    }
  });

  test('without Intl.Locale week info: weeks start by region (US Sunday, DE Monday, EG Saturday, MV Friday, BR Sunday)', async () => {
    // Firefox has no week info; take it away here so the region fallback runs in every engine.
    const proto = Intl.Locale.prototype as unknown as Record<string, unknown>;
    const saved = ['getWeekInfo', 'weekInfo'].map((k) => [k, Object.getOwnPropertyDescriptor(proto, k)] as const);
    for (const [k] of saved) delete proto[k];
    try {
      await render(<div>{['en-US', 'de-DE', 'de', 'ar-EG', 'dv-MV', 'pt-BR'].map((l) => <Calendar key={l} data-l={l} locale={l} defaultMonth={new Date(2025, 2, 1)} />)}</div>);
      const starts = [...document.querySelectorAll<HTMLElement>('[data-l]')].map((c) => c.dataset.l + ':' + c.querySelector<HTMLElement>('[role=grid] [data-date]')!.dataset.date).join();
      expect(starts).toBe('en-US:2025-02-23,de-DE:2025-02-24,de:2025-02-24,ar-EG:2025-03-01,dv-MV:2025-02-28,pt-BR:2025-02-23');
    } finally {
      for (const [k, d] of saved) if (d) Object.defineProperty(proto, k, d);
    }
  });

  test('today is aria-current="date" and the Tab stop when nothing is chosen', async () => {
    await render(<Calendar data-testid="today" />);
    const b = q('[data-testid=today] [aria-current=date]');
    expect([b.textContent, b.getAttribute('tabindex'), /today/.test(b.className)]).toEqual([String(new Date().getDate()), '0', true]);
  });

  test('arrows move a day or week, Home/End to the week\'s ends, PageUp/PageDown a month, Shift+PageUp a year, stopping at min and max; moving past the month shows the next one and keeps focus on the day; onMonthChange gets the first of each month shown', async () => {
    const months: string[] = [];
    await render(<Cal months={months} />);
    cal('[data-date="2025-03-10"]').focus();
    const seen: string[] = [];
    for (const k of ['{ArrowRight}', '{ArrowDown}', '{ArrowLeft}', '{ArrowUp}', '{End}', '{Home}', '{PageDown}', '{PageUp}', '{Shift>}{PageUp}{/Shift}']) { await userEvent.keyboard(k); seen.push(focused()); }
    // A year back from Mar 9 2025 is before min (Feb 3 2025): it stops there, and ArrowUp stays.
    expect(seen).toEqual(['2025-03-11', '2025-03-18', '2025-03-17', '2025-03-10', '2025-03-15', '2025-03-09', '2025-04-09', '2025-03-09', '2025-02-03']);
    await userEvent.keyboard('{ArrowUp}');
    expect([focused(), title()]).toEqual(['2025-02-03', 'February 2025']);
    // A year on is after max (Jun 20 2025): it stops there too.
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect([focused(), title()]).toEqual(['2025-06-20', 'June 2025']);
    await userEvent.keyboard('{ArrowDown}{End}');
    expect(focused()).toBe('2025-06-20');
    await userEvent.keyboard('{PageUp}{PageUp}');
    expect([focused(), months.slice(-2).join('|')]).toEqual(['2025-04-20', 'Thu May 01 2025|Tue Apr 01 2025']);
  });

  test('keyboard table: Space picks the focused day, as Enter does (FH1)', async () => {
    const picks: string[] = [];
    await render(<Cal picks={picks} defaultMonth={new Date(2025, 3, 1)} />);
    cal('[data-date="2025-04-08"]').focus();
    await userEvent.keyboard('{ArrowRight}[Space]');
    expect(picks.join('|')).toBe('Wed Apr 09 2025');
  });

  test('Enter and a click pick a day: onValueChange, aria-selected moves', async () => {
    const picks: string[] = [];
    await render(<Cal picks={picks} defaultMonth={new Date(2025, 3, 1)} />);
    cal('[data-date="2025-04-08"]').focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(cal('[data-date="2025-04-17"]'));
    expect(picks.join('|')).toBe('Tue Apr 08 2025|Thu Apr 17 2025');
    expect([...document.querySelectorAll<HTMLElement>('[data-testid=cal] [aria-selected=true] button')].map((b) => b.dataset.date).join()).toBe('2025-04-17');
  });

  test('min: days before it are aria-disabled and the previous button stops at its month; isDateDisabled: refused days are aria-disabled, in disabled-text and can\'t be picked; max: the next button stops at its month', async () => {
    const picks: string[] = [];
    await render(<Cal picks={picks} defaultMonth={new Date(2025, 3, 1)} />);
    await userEvent.click(cal('button[aria-label="Previous month"]'));
    await userEvent.click(cal('button[aria-label="Previous month"]'));
    expect([title(), cal<HTMLButtonElement>('.srp-calendar__nav--prev').disabled]).toEqual(['February 2025', true]);
    expect([cal('[data-date="2025-02-02"]').getAttribute('aria-disabled'), cal('[data-date="2025-02-03"]').getAttribute('aria-disabled')]).toEqual(['true', null]);
    await userEvent.click(cal('button[aria-label="Next month"]'));
    await userEvent.click(cal('[data-date="2025-03-16"]'), { force: true });
    expect([cal('[data-date="2025-03-16"]').getAttribute('aria-disabled'), picks.length]).toEqual(['true', 0]);
    await expect.poll(() => disabledLook(cal('[data-date="2025-03-16"]'))).toBe('neutral');
    for (let i = 0; i < 3; i++) await userEvent.click(cal('button[aria-label="Next month"]'));
    expect([title(), cal<HTMLButtonElement>('.srp-calendar__nav--next').disabled]).toEqual(['June 2025', true]);
  });

  test('--calendar-bg-selected and --calendar-color-selected override one calendar; the old names, state first (--calendar-selected-bg), are gone since 15.0.0', async () => {
    await render(<>
      <Calendar data-testid="tok" style={{ '--calendar-bg-selected': 'rgb(1, 2, 3)', '--calendar-color-selected': 'rgb(4, 5, 6)' } as React.CSSProperties} defaultValue={new Date(2025, 2, 10)} weekStartsOn={0} />
      <Calendar data-testid="tok-old" style={{ '--calendar-selected-bg': 'rgb(1, 2, 3)', '--calendar-selected-color': 'rgb(4, 5, 6)' } as React.CSSProperties} defaultValue={new Date(2025, 2, 10)} weekStartsOn={0} />
    </>);
    const look = (id: string) => { const c = getComputedStyle(q(`[data-testid=${id}] .srp-calendar__day--selected`)); return `${c.backgroundColor} / ${c.color}`; };
    await expect.poll(() => look('tok')).toBe('rgb(1, 2, 3) / rgb(4, 5, 6)');
    await expect.poll(() => look('tok-old')).not.toContain('rgb(1, 2, 3)');
  });

  test('pressed: a day held down fills with pressed, one step past hover', async () => {
    await render(<Cal />);
    const d = cal('[data-date="2025-03-12"]');
    await press(d, () => expect.poll(() => css(d).backgroundColor).toBe(color('var(--pressed)')));
  });

  test('a month arrow that reaches min or max hands focus to the other arrow, rather than drop it to the page (FJ1)', async () => {
    await render(<Cal />);
    const prev = cal<HTMLButtonElement>('button[aria-label="Previous month"]'), next = cal<HTMLButtonElement>('button[aria-label="Next month"]');
    prev.focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => [title(), prev.disabled, document.activeElement === next]).toEqual(['February 2025', true, true]);
    for (let i = 0; i < 4; i++) await userEvent.keyboard('{Enter}');
    await expect.poll(() => [title(), next.disabled, document.activeElement === prev]).toEqual(['June 2025', true, true]);
    await userEvent.keyboard('{Enter}');
    expect([title(), document.activeElement === prev]).toEqual(['May 2025', true]);
  });

});

describe('Calendar: long jumps and midnight (EM1)', () => {
  const menus = () => [...document.querySelectorAll<HTMLSelectElement>('[data-testid=cal] select')];
  const pickOption = async (s: HTMLSelectElement, value: string) => { await userEvent.selectOptions(s, value); };

  test('the heading opens the year\'s months, and theirs twelve years: a birth date in 1990 is four clicks away, and a pick goes back down to its month\'s days', async () => {
    const months: string[] = [];
    await render(<Cal months={months} min={undefined} max={undefined} isDateDisabled={undefined} />);
    const head = cal<HTMLButtonElement>('.srp-calendar__heading');
    // Named by what it shows, described by what it does.
    expect([head.textContent.startsWith('March 2025'), document.getElementById(head.getAttribute('aria-describedby')!)!.textContent]).toEqual([true, 'Choose a month']);
    await userEvent.click(head);
    const grid = () => cal<HTMLTableElement>('[role=grid]:not([hidden])');
    const cells = () => [...grid().querySelectorAll('button')].map((b) => b.querySelector('[aria-hidden]')?.textContent ?? b.textContent);
    // The year's months, named by the hidden title that announces the change, the day grid gone, focus on March.
    expect([title(), cells().join(' '), grid().getAttribute('aria-labelledby'), cal('.srp-calendar__grid').hidden]).toEqual(['2025', 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec', cal('.srp-calendar__title').id, true]);
    expect([(document.activeElement as HTMLElement).textContent, grid().querySelector('[aria-selected=true]')!.textContent]).toEqual(['MarMarch 2025', 'MarMarch 2025']);
    expect(document.querySelector('[aria-label="Previous year"]')).not.toBeNull();
    await userEvent.click(cal('.srp-calendar__heading'));
    expect([title(), cells()[0], cells()[11], (document.activeElement as HTMLElement).textContent]).toEqual(['2016–2027', '2016', '2027', '2025']);
    await userEvent.click(page.getByRole('button', { name: 'Previous 12 years' }));
    await userEvent.click(page.getByRole('button', { name: 'Previous 12 years' }));
    expect(title()).toBe('1992–2003');
    await userEvent.click(page.getByRole('button', { name: 'Previous 12 years' }));
    await userEvent.click(page.getByText('1990', { exact: true }));
    expect([title(), (document.activeElement as HTMLElement).textContent]).toEqual(['1990', 'MarMarch 1990']);
    await userEvent.click(page.getByText('Jul', { exact: true }));
    expect([title(), cal('.srp-calendar__grid').hidden, months.at(-1), focused()]).toEqual(['July 1990', false, new Date(1990, 6, 1).toDateString(), '1990-07-10']);
  });

  test('the months and years by keyboard: Enter on the heading, arrows by one and by a row, Page keys by a page, Enter picks; Escape goes back a level and doesn\'t reach the page (a DatePicker\'s popup stays open)', async () => {
    const outside = vi.fn<(key: string) => void>();
    await render(<div onKeyDown={(e) => outside(e.key)}><Cal min={undefined} max={undefined} isDateDisabled={undefined} /></div>);
    cal<HTMLButtonElement>('.srp-calendar__heading').focus();
    const at = () => (document.activeElement as HTMLElement).textContent;
    await userEvent.keyboard('{Enter}');
    expect(at()).toBe('MarMarch 2025');
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(at()).toBe('JulJuly 2025');
    await userEvent.keyboard('{Home}');
    expect(at()).toBe('JulJuly 2025');
    await userEvent.keyboard('{End}{PageDown}');
    expect([at(), title()]).toEqual(['SepSeptember 2026', '2026']);
    await userEvent.keyboard('{Escape}');
    expect([title(), document.activeElement === cal('.srp-calendar__heading'), cal('.srp-calendar__grid').hidden, outside.mock.calls.flat().filter((k) => k === 'Escape')]).toEqual(['March 2025', true, false, []]);
    await userEvent.keyboard('{Enter}');
    await userEvent.click(cal('.srp-calendar__heading'));
    expect(at()).toBe('2025');
    await userEvent.keyboard('{ArrowUp}{PageUp}');
    expect([at(), title()]).toEqual(['2010', '2004–2015']);
    await userEvent.keyboard('{Escape}');
    expect([title(), at()]).toEqual(['2010', 'MarMarch 2010']);
    await userEvent.keyboard('{ArrowLeft}{Enter}');
    expect([title(), focused()]).toEqual(['February 2010', '2010-02-10']);
    expect(outside.mock.calls.flat().filter((k) => k === 'Escape')).toEqual([]);
  });

  test('the year buttons turn the months a year at a time, and the one that reaches min or max hands focus to the other, as the month arrows do', async () => {
    await render(<Calendar data-testid="cal" locale="en-US" defaultValue={new Date(2025, 2, 10)} min={new Date(2024, 4, 1)} max={new Date(2026, 8, 30)} />);
    await userEvent.click(cal('.srp-calendar__heading'));
    const prev = () => q<HTMLButtonElement>('[data-testid=cal] [aria-label="Previous year"]'), next = () => q<HTMLButtonElement>('[data-testid=cal] [aria-label="Next year"]');
    await userEvent.click(next());
    expect([title(), next().disabled, document.activeElement === prev()]).toEqual(['2026', true, true]);
    await userEvent.click(prev());
    await userEvent.click(prev());
    expect([title(), prev().disabled, document.activeElement === next()]).toEqual(['2024', true, true]);
  });

  test('the months and years keep to min and max: the ones outside are disabled and can\'t be picked, the page buttons stop, and keys stop at the ends', async () => {
    const months: string[] = [];
    await render(<Cal months={months} />);   // min Feb 3 2025, max Jun 20 2025
    await userEvent.click(cal('.srp-calendar__heading'));
    const off = () => [...cal('[role=grid]:not([hidden])').querySelectorAll('[aria-disabled=true]')].map((b) => b.querySelector('[aria-hidden]')?.textContent ?? b.textContent);
    expect(off()).toEqual(['Jan', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    // Drawn as a disabled day is: disabled-text, struck through, at full opacity (it was faded by opacity alone).
    const jan = cal('[role=grid]:not([hidden]) [aria-disabled=true]');
    expect([disabledLook(jan), css(jan).textDecorationLine]).toEqual(['neutral', 'line-through']);
    expect([q<HTMLButtonElement>('[aria-label="Previous year"]').disabled, q<HTMLButtonElement>('[aria-label="Next year"]').disabled]).toEqual([true, true]);
    // A click the browser lets through (aria-disabled leaves the button pressable) picks nothing.
    page.getByText('Jan', { exact: true }).element().closest('button')!.click();
    expect(title()).toBe('2025');
    await userEvent.keyboard('{End}{ArrowDown}{ArrowDown}');
    expect((document.activeElement as HTMLElement).textContent).toBe('JunJune 2025');
    await userEvent.click(cal('.srp-calendar__heading'));
    expect(off()).toEqual(['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2026', '2027']);
    await userEvent.keyboard('{Enter}{Enter}');
    expect([title(), months]).toEqual(['June 2025', [new Date(2025, 5, 1).toDateString()]]);
  });

  test('the months, years and heading in every theme: names 4.5:1, the picked one 4.5:1 on its fill; the months keep the days\' size, so the calendar doesn\'t jump', async () => {
    await render(<Cal min={undefined} max={undefined} isDateDisabled={undefined} />);
    const box = () => { const r = q('[data-testid=cal]').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
    const days = box();
    await userEvent.click(cal('.srp-calendar__heading'));
    expect(box()).toEqual(days);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(q('body')).backgroundColor, sel = cal('.srp-calendar__period--selected');
      for (const [k, fg, on] of [['heading', css(cal('.srp-calendar__heading')).color, bg], ['month', css(cal('.srp-calendar__period:not(.srp-calendar__period--selected)')).color, bg], ['picked', css(sel).color, css(sel).backgroundColor]] as const) {
        const r = contrast(fg, on); if (r < 4.5) low.push(`${th} ${k} ${r.toFixed(2)}`);
      }
    }
    document.documentElement.removeAttribute('data-theme');
    expect(low).toEqual([]);
  });

  test('a little space between the weeks (calendar-row-gap, 4px)', async () => {
    await render(<Cal />);
    const rows = [...cal('.srp-calendar__grid tbody').querySelectorAll('tr')].map((r) => r.querySelector('button')!.getBoundingClientRect());
    expect(Math.round(rows[1]!.top - rows[0]!.bottom)).toBe(4);
  });

  test('monthYearPicker: Month and Year menus jump 18 months in two picks; the title stays for screen readers; the header fits the grid', async () => {
    const seen: string[] = [];
    await render(<Calendar data-testid="cal" monthYearPicker defaultMonth={new Date(2026, 9, 1)} locale="en-US" onMonthChange={(m) => seen.push(m.toISOString().slice(0, 7))} />);
    const [m, y] = menus();
    expect([m!.getAttribute('aria-label'), y!.getAttribute('aria-label'), m!.selectedOptions[0]!.text, y!.value]).toEqual(['Month', 'Year', 'October', '2026']);
    const now = new Date().getFullYear();
    expect([+y!.options[0]!.value, +y!.options[y!.options.length - 1]!.value]).toEqual([now - 100, now + 10]);
    await pickOption(y!, '2028');
    await pickOption(m!, '3');
    expect(title()).toBe('April 2028');
    expect(seen.length).toBe(2);
    expect(cal('.srp-calendar__title').getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(cal('.srp-calendar__header').getBoundingClientRect().width).toBeLessThanOrEqual(cal('.srp-calendar__grid').getBoundingClientRect().width + 1);
    expect(cal('.srp-calendar__header').scrollWidth).toBeLessThanOrEqual(cal('.srp-calendar__header').clientWidth);
  });

  test('monthYearPicker inside a form: a reset leaves the Month and Year menus on the month the grid shows (GR87)', async () => {
    await render(<form id="f87"><Calendar data-testid="cal" monthYearPicker defaultMonth={new Date(2026, 5, 1)} locale="en-US" /></form>);
    const f = document.getElementById('f87') as HTMLFormElement, shown = () => [menus()[0]!.selectedOptions[0]!.text, menus()[1]!.value, title()];
    f.reset();
    await new Promise((r) => setTimeout(r, 50));
    expect(shown()).toEqual(['June', '2026', 'June 2026']);
    await pickOption(menus()[1]!, '2027');
    f.reset();
    await new Promise((r) => setTimeout(r, 50));
    expect(shown()).toEqual(['June', '2027', 'June 2027']);
    // They're not form data either.
    expect([[...f.elements].filter((e) => e.tagName === 'SELECT').length, [...new FormData(f).keys()]]).toEqual([0, []]);
  });

  test('monthYearPicker with min and max: only their years, months outside are disabled, and a year that lands outside clamps', async () => {
    await render(<Calendar data-testid="cal" monthYearPicker min="2025-03-10" max="2027-08-20" defaultMonth={new Date(2026, 0, 1)} locale="en-US" />);
    const [m, y] = menus();
    expect([...y!.options].map((o) => o.value)).toEqual(['2025', '2026', '2027']);
    await pickOption(y!, '2025');
    expect(title()).toBe('March 2025');
    expect([...menus()[0]!.options].filter((o) => o.disabled).map((o) => o.text)).toEqual(['January', 'February']);
    await pickOption(menus()[1]!, '2027');
    await pickOption(menus()[0]!, '7');
    expect(title()).toBe('August 2027');
    expect([...menus()[0]!.options].filter((o) => o.disabled).map((o) => o.text)).toEqual(['September', 'October', 'November', 'December']);
    void m;
  });

  test('today moves at midnight while the calendar stays open', async () => {
    const { vi } = await import('vitest');
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    try {
      vi.setSystemTime(new Date(2026, 9, 26, 23, 59, 59));
      await render(<Calendar data-testid="cal" locale="en-US" />);
      expect(cal('[aria-current="date"]').dataset.date).toBe('2026-10-26');
      await React.act(async () => { await vi.advanceTimersByTimeAsync(2000); });
      expect(cal('[aria-current="date"]').dataset.date).toBe('2026-10-27');
    } finally {
      vi.useRealTimers();
    }
  });

  test('L8E78: with no value, a today outside min..max opens on the nearest month that can be picked, with the Tab stop on min or max', async () => {
    const t = new Date(), at = (n: number) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + n);
    const iso = (d: Date) => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    const name = (d: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
    const lo = at(400), hi = at(-400);
    await render(<><Calendar data-testid="lo" locale="en-US" min={lo} /><Calendar data-testid="hi" locale="en-US" max={hi} /></>);
    const grid = (id: string) => q(`[data-testid=${id}] [role=grid]`);
    const stop = (id: string) => grid(id).querySelector<HTMLElement>('button[tabindex="0"]')!.dataset.date;
    const named = (id: string) => document.getElementById(grid(id).getAttribute('aria-labelledby')!)!.textContent;
    expect([named('lo'), stop('lo'), named('hi'), stop('hi')])
      .toEqual([name(lo), iso(lo), name(hi), iso(hi)]);
  });
});

describe('Calendar weekday headers in Arabic, Persian, Hebrew and Thai (GR6)', () => {
  test('where the short name is the full name, two words or long (Thai), the header shows the narrow name, so each fits its 32px column and the grid stays 7 columns of 32px; screen readers still get the full name', async () => {
    const at = new Date(2025, 2, 10);
    await render(<div>{['ar-EG', 'fa-IR', 'he-IL', 'th-TH', 'en-US'].map((l) => <div key={l} dir={['en-US', 'th-TH'].includes(l) ? 'ltr' : 'rtl'}><Calendar data-locale={l} locale={l} defaultMonth={at} /></div>)}</div>);
    const sat = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(2025, 2, 8));
    for (const l of ['ar-EG', 'fa-IR', 'he-IL', 'th-TH', 'en-US']) {
      const grid = q(`[data-locale="${l}"] [role=grid]`), heads = [...grid.querySelectorAll('th')];
      expect(heads.map((th) => th.getBoundingClientRect().width)).toEqual(Array(7).fill(32));
      for (const th of heads) {
        const shown = th.querySelector('[aria-hidden]') as HTMLElement;
        expect(shown.getBoundingClientRect().width).toBeLessThanOrEqual(32);
        // The full name stays in abbr and the visually hidden text.
        expect(th.getAttribute('abbr')).toBe(th.querySelector('span:not([aria-hidden])')!.textContent);
      }
      if (l !== 'en-US') expect(heads.every((th) => (th.querySelector('[aria-hidden]')!.textContent.length) < th.getAttribute('abbr')!.length)).toBe(true);
      if (l === 'en-US') expect(heads.some((th) => th.textContent.startsWith(sat))).toBe(true);
    }
  });
  test('a 320px screen with text at 125%: the seven days fit inside it, each still at least 24px (GR71)', async () => {
    document.documentElement.style.fontSize = '125%';
    await page.viewport(320, 700);
    try {
      await render(<div style={{ padding: '0 24px' }}><Calendar data-testid="cal" defaultMonth={new Date(2025, 2, 1)} /></div>);
      const days = [...document.querySelectorAll<HTMLElement>('[data-testid=cal] [data-date]')];
      // The week, edge to edge, leaves a 3rem gutter (60px here) for the page's and a popover's padding.
      const week = Math.max(...days.map((d) => d.getBoundingClientRect().right)) - Math.min(...days.map((d) => d.getBoundingClientRect().left));
      expect([week <= 320 - 60 + 1, Math.min(...days.map((d) => d.getBoundingClientRect().width)) >= 24]).toEqual([true, true]);
      // Each day a whole pixel wide (178), not a seventh of the screen (37.14px), so the edges stay sharp. Chrome and
      // Edge 123 and 124 have no round(): there the day keeps the unrounded size the CSS falls back to.
      expect([...new Set(days.map((d) => d.getBoundingClientRect().width))]).toEqual([CSS.supports('width: round(down, 1px, 1px)') ? 37 : 37.140625]);
    } finally { document.documentElement.style.fontSize = ''; await page.viewport(900, 700); }
  });
});

describe('Calendar follows a value set from outside (L8E103)', () => {
  test('a controlled value moved to another month shows that month and takes the Tab stop; in the same month it takes the Tab stop; a controlled month stays put', async () => {
    const months: string[] = [];
    const stop = () => cal<HTMLElement>('button[tabindex="0"]').dataset.date;
    const r = await render(<Cal value={new Date(2025, 2, 10)} months={months} />);
    await r.rerender(<Cal value={new Date(2025, 4, 6)} months={months} />);
    expect([title(), stop()]).toEqual(['May 2025', '2025-05-06']);
    await r.rerender(<Cal value={new Date(2025, 4, 20)} months={months} />);
    expect([title(), stop()]).toEqual(['May 2025', '2025-05-20']);
    await r.rerender(<Cal value={new Date(2025, 3, 2)} month={new Date(2025, 4, 1)} months={months} />);
    expect([title(), stop()]).toEqual(['May 2025', '2025-05-20']);
  });
});

// A server whose date isn't the visitor's (a UTC server, a visitor in Jakarta before 7am): the page must hydrate
// with no mismatch, and today is the visitor's (GR210).
describe('server-rendered on another day than the visitor\'s', () => {
  async function hydrateFrom(serverDay: Date, visitorDay: Date, ui: React.ReactElement) {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');
    const { flushSync } = await import('react-dom');
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(serverDay);
      const host = document.createElement('div');
      host.innerHTML = renderToString(ui);
      document.body.appendChild(host);
      vi.setSystemTime(visitorDay);
      const errors: string[] = [], logError = console.error;
      console.error = (...a: unknown[]) => { errors.push(a.map(String).join(' ')); };
      let root: ReturnType<typeof hydrateRoot> | undefined;
      try {
        flushSync(() => { root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) }); });
        await new Promise((r) => setTimeout(r, 30));
      } finally { console.error = logError; }
      return { host, errors, done: () => { root?.unmount(); host.remove(); } };
    } finally { vi.useRealTimers(); }
  }
  const today = (host: HTMLElement) => [...host.querySelectorAll('[aria-current="date"]')].map((b) => (b as HTMLElement).dataset.date);

  for (const [name, ui] of [['with a value', <Calendar key="v" aria-label="Day" defaultValue={new Date(2026, 10, 3)} />], ['with no value', <Calendar key="n" aria-label="Day" />]] as const) {
    test(`${name}: no mismatch, and today is the visitor's day`, async () => {
      const r = await hydrateFrom(new Date(2026, 10, 7, 22, 0), new Date(2026, 10, 8, 5, 0), ui);
      try {
        expect(r.errors).toEqual([]);
        expect(today(r.host)).toEqual(['2026-11-08']);
        expect([...r.host.querySelectorAll('button')].filter((b) => b.classList.contains('srp-calendar__day--today')).map((b) => b.dataset.date)).toEqual(['2026-11-08']);
      } finally { r.done(); }
    });
  }

  // The clock also picks the month when nothing else does: the last evening of October on the server is November
  // (or next year) for the visitor, with other weeks in the grid (GR396).
  for (const [name, server, visitor, shown] of [
    ['the month turns', new Date(2026, 9, 31, 22, 0), new Date(2026, 10, 1, 5, 0), 'November 2026'],
    ['the year turns', new Date(2026, 11, 31, 22, 0), new Date(2027, 0, 1, 5, 0), 'January 2027'],
  ] as const) {
    test(`${name} between the server and the visitor: no mismatch, and the visitor's month and today show`, async () => {
      const months: string[] = [];
      const r = await hydrateFrom(server, visitor, <Calendar aria-label="Day" locale="en-US" onMonthChange={(m) => months.push(m.getFullYear() + '-' + (m.getMonth() + 1))} />);
      try {
        expect(r.errors).toEqual([]);
        expect(months).toEqual([shown.endsWith('2027') ? '2027-1' : '2026-11']);
        expect([r.host.querySelector('h2')!.textContent, today(r.host)]).toEqual([shown, [shown.endsWith('2027') ? '2027-01-01' : '2026-11-01']]);
      } finally { r.done(); }
    });
  }
  test('the year turns with month and year menus: no mismatch (the years listed follow the shown month until hydration)', async () => {
    const r = await hydrateFrom(new Date(2026, 11, 31, 22, 0), new Date(2027, 0, 1, 5, 0), <Calendar aria-label="Day" locale="en-US" monthYearPicker />);
    try {
      expect(r.errors).toEqual([]);
      expect(r.host.querySelector('h2')!.textContent).toBe('January 2027');
    } finally { r.done(); }
  });
  test('a controlled month stays the app\'s: no mismatch, and no onMonthChange after hydration', async () => {
    const onMonthChange = vi.fn();
    const r = await hydrateFrom(new Date(2026, 9, 31, 22, 0), new Date(2026, 10, 1, 5, 0), <Calendar aria-label="Day" locale="en-US" month={new Date(2026, 9, 1)} onMonthChange={onMonthChange} />);
    try {
      expect([r.errors, r.host.querySelector('h2')!.textContent, onMonthChange.mock.calls.length]).toEqual([[], 'October 2026', 0]);
    } finally { r.done(); }
  });
  test('a given defaultMonth is never replaced by the visitor\'s month', async () => {
    const r = await hydrateFrom(new Date(2026, 9, 31, 22, 0), new Date(2026, 10, 1, 5, 0), <Calendar aria-label="Day" locale="en-US" defaultMonth={new Date(2026, 9, 15)} />);
    try {
      expect(r.errors).toEqual([]);
      expect(r.host.querySelector('h2')!.textContent).toBe('October 2026');
    } finally { r.done(); }
  });

  test('presets: no mismatch, and the pressed preset follows the visitor\'s today, not the server\'s (GR286)', async () => {
    const r = await hydrateFrom(new Date(2026, 10, 7, 22, 0), new Date(2026, 10, 8, 5, 0), <Calendar aria-label="Day" locale="en-US" presets defaultValue={new Date(2026, 10, 8)} />);
    try {
      expect(r.errors).toEqual([]);
      expect([...r.host.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.textContent)).toEqual(['Today']);
    } finally { r.done(); }
  });
});

describe('Calendar presets (RU11)', () => {
  const iso = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  test('presets={true}: Today, Tomorrow and In a week after the days; one picks its day and shows its month; one past max is disabled', async () => {
    const got: string[] = [];
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const max = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 3);
    await render(<Calendar id="cp" locale="en-US" presets max={max} onValueChange={(_d, { iso: s }) => got.push(s)} />);
    const group = page.getByRole('group', { name: 'Shortcuts' });
    await expect.element(group).toBeInTheDocument();
    const btns = [...group.element().querySelectorAll('button')];
    expect(btns.map((b) => [b.textContent, b.getAttribute('aria-disabled')])).toEqual([['Today', null], ['Tomorrow', null], ['In a week', 'true']]);
    await userEvent.click(btns[1]!);
    const tomorrow = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    expect(got).toEqual([iso(tomorrow)]);
    expect(btns[1]!.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector(`#cp [data-date="${iso(tomorrow)}"]`)!.closest('td')!.getAttribute('aria-selected')).toBe('true');
  });
  test('your own presets jump to their month; without presets there is no list', async () => {
    await render(<><Calendar id="co" locale="en-US" defaultMonth={new Date(2025, 0, 1)} presets={[{ label: 'Launch', value: '2025-06-15' }]} /><Calendar id="cn" locale="en-US" /></>);
    await userEvent.click(page.getByRole('button', { name: 'Launch' }));
    expect(document.querySelector('#co [data-date="2025-06-15"]')!.closest('td')!.getAttribute('aria-selected')).toBe('true');
    expect(document.querySelector('#cn [role=group]')).toBe(null);
  });
});

describe('a day under the pointer', () => {
  test('today keeps 4.5:1 on the hover fill in every theme, as do the other days', async () => {
    const still = document.createElement('style'); still.textContent = '*, *::before, *::after { transition: none !important; }'; document.head.appendChild(still);
    await render(<Calendar aria-label="Pick a day" />);
    const days = [...document.querySelectorAll<HTMLElement>('[role="grid"] button')];
    const today = days.find((d) => d.getAttribute('aria-current') === 'date')!, other = days.find((d) => d !== today && !d.getAttribute('aria-disabled'))!;
    const low: string[] = [];
    for (const [name, day] of [['today', today], ['another day', other]] as const) {
      await userEvent.hover(day);
      for (const th of THEMES) {
        document.documentElement.setAttribute('data-theme', th);
        const r = contrast(css(day).color, css(day).backgroundColor);
        if (r < 4.5) low.push(`${th} ${name} ${r.toFixed(2)}`);
      }
      document.documentElement.setAttribute('data-theme', 'blue-light');
    }
    still.remove();
    expect(low).toEqual([]);
  });
});

describe('Calendar: other calendar systems (RX9)', () => {
  // The shown month's days: from its 1st to the day before the next month's 1st (the grid's other days are the months around it).
  const inMonth = () => {
    const all = [...document.querySelectorAll<HTMLButtonElement>('[data-testid=cal] [role=grid]:not([hidden]) button[data-date]')], from = all.findIndex((b) => b.textContent === '1');
    const to = all.findIndex((b, i) => i > from && b.textContent === '1');
    return all.slice(from, to < 0 ? undefined : to);
  };
  const titleIn = (calendar: string, d: Date, locale = 'en-US') => new Intl.DateTimeFormat(locale, { calendar, numberingSystem: 'latn', month: 'long', year: 'numeric' }).format(d);

  test('calendar="persian": the grid is the Persian month (Aban 1405 runs 23 Oct to 21 Nov 2026), its days numbered 1 to 30; keys and picks give Dates', async () => {
    const picks: string[] = [], months: string[] = [];
    await render(<Calendar data-testid="cal" calendar="persian" locale="en-US" weekStartsOn={6} defaultValue="2026-11-15" onValueChange={(_, { iso }) => picks.push(iso)} onMonthChange={(m) => months.push(m.toDateString())} />);
    const days = inMonth();
    expect([title(), days.length, days[0]!.dataset.date, days[0]!.textContent, days.at(-1)!.dataset.date, days.at(-1)!.textContent]).toEqual([titleIn('persian', new Date(2026, 10, 15)), 30, '2026-10-23', '1', '2026-11-21', '30']);
    expect(title()).toContain('1405');
    // The selected day's name is in the Persian calendar too.
    expect(cal('[aria-selected=true] button').getAttribute('aria-label')).toBe(new Intl.DateTimeFormat('en-US', { calendar: 'persian', numberingSystem: 'latn', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(2026, 10, 15)));
    // PageDown: the 24th of Aban to the 24th of Azar, which is 15 Dec; the next month starts on 22 Nov.
    cal<HTMLButtonElement>('[data-date="2026-11-15"]').focus();
    await userEvent.keyboard('{PageDown}');
    expect([focused(), months.at(-1), inMonth()[0]!.dataset.date]).toEqual(['2026-12-15', new Date(2026, 10, 22).toDateString(), '2026-11-22']);
    await userEvent.keyboard('{Enter}');
    expect(picks).toEqual(['2026-12-15']);
  });

  test('calendar="islamic-umalqura" in Arabic: Jumada II 1448 from 11 Nov 2026, with Latin digits; Hijri months of 29 and 30 days step right', async () => {
    await render(<Calendar data-testid="cal" calendar="islamic-umalqura" locale="ar-SA" defaultMonth={new Date(2026, 10, 15)} />);
    expect([title(), inMonth()[0]!.dataset.date, inMonth()[0]!.textContent]).toEqual([titleIn('islamic-umalqura', new Date(2026, 10, 15), 'ar-SA'), '2026-11-11', '1']);
    const lengths: number[] = [];
    for (let i = 0; i < 12; i++) { lengths.push(inMonth().length); await userEvent.click(cal('.srp-calendar__nav--next')); }
    // Every month has 29 or 30 days, and twelve of them make a lunar year of 354 or 355.
    expect([lengths.every((n) => n === 29 || n === 30), [354, 355].includes(lengths.reduce((a, b) => a + b))]).toEqual([true, true]);
  });

  test('buddhist, japanese and roc keep the Gregorian months and name the year their way', async () => {
    const r = await render(<Calendar data-testid="cal" calendar="buddhist" locale="en-US" defaultMonth={new Date(2026, 10, 15)} />);
    expect([title(), inMonth()[0]!.dataset.date, inMonth().length]).toEqual([titleIn('buddhist', new Date(2026, 10, 1)), '2026-11-01', 30]);
    expect(title()).toContain('2569');
    await r.rerender(<Calendar data-testid="cal" calendar="japanese" locale="ja-JP" defaultMonth={new Date(2026, 10, 15)} />);
    expect([title(), inMonth()[0]!.dataset.date]).toEqual([titleIn('japanese', new Date(2026, 10, 1), 'ja-JP'), '2026-11-01']);
  });

  test('the months, the years and the menus count in the calendar: the heading opens Persian 1405, and Dey starts on 22 Dec 2026', async () => {
    await render(<Calendar data-testid="cal" calendar="persian" locale="en-US" defaultMonth={new Date(2026, 10, 15)} />);
    await userEvent.click(cal('.srp-calendar__heading'));
    const grid = () => cal<HTMLTableElement>('[role=grid]:not([hidden])');
    const cells = () => [...grid().querySelectorAll('button')].map((b) => b.querySelector('span:last-child')?.textContent ?? b.textContent);
    expect([title(), cells()[0], cells()[9]]).toEqual([new Intl.DateTimeFormat('en-US', { calendar: 'persian', numberingSystem: 'latn', year: 'numeric' }).format(new Date(2026, 10, 15)), titleIn('persian', new Date(2026, 2, 21)), titleIn('persian', new Date(2026, 11, 22))]);
    await userEvent.click(grid().querySelectorAll('button')[9]!);
    expect([title(), inMonth()[0]!.dataset.date]).toEqual([titleIn('persian', new Date(2026, 11, 22)), '2026-12-22']);
  });

  test('monthYearPicker in a Hijri calendar: the year menu lists Hijri years, and a pick shows that year\'s month', async () => {
    const seen: string[] = [];
    await render(<Calendar data-testid="cal" calendar="islamic-umalqura" monthYearPicker locale="en-US" defaultMonth={new Date(2026, 10, 15)} onMonthChange={(m) => seen.push(m.toDateString())} />);
    const [month, year] = [...document.querySelectorAll<HTMLSelectElement>('[data-testid=cal] select')];
    expect([month!.value, year!.value, month!.options[5]!.textContent]).toEqual(['5', '1448', new Intl.DateTimeFormat('en-US', { calendar: 'islamic-umalqura', month: 'long' }).format(new Date(2026, 10, 15))]);
    await userEvent.selectOptions(year!, '1447');
    // Jumada II 1447 began on 22 Nov 2025.
    expect([inMonth()[0]!.dataset.date, seen.at(-1)]).toEqual(['2025-11-22', new Date(2025, 10, 22).toDateString()]);
  });

  test('every calendar system: the month\'s days run 1 to its last (29 to 31) on days in a row, and the next month starts the day after', async () => {
    const after = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(y!, m! - 1, d! + 1); return [t.getFullYear(), String(t.getMonth() + 1).padStart(2, '0'), String(t.getDate()).padStart(2, '0')].join('-'); };
    for (const calendar of ['gregory', 'buddhist', 'japanese', 'roc', 'persian', 'islamic-umalqura', 'islamic-civil', 'islamic-tbla', 'indian'] as const) {
      const r = await render(<Calendar data-testid="cal" calendar={calendar} locale="en-US" defaultMonth={new Date(2026, 10, 15)} />);
      const days = inMonth(), dates = days.map((b) => b.dataset.date!);
      expect([calendar, days.map((b) => b.textContent).join(), dates.every((d, i) => i === 0 || d === after(dates[i - 1]!)), days.length >= 29 && days.length <= 31])
        .toEqual([calendar, days.map((_, i) => String(i + 1)).join(), true, true]);
      expect(title()).toBe(titleIn(calendar, new Date(2026, 10, 15)));
      await userEvent.click(cal('.srp-calendar__nav--next'));
      expect([calendar, inMonth()[0]!.dataset.date]).toEqual([calendar, after(dates.at(-1)!)]);
      await r.unmount();
    }
  });

  test('a calendar the grids don\'t draw (hebrew, of 13 months) warns once and draws Gregorian', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Calendar data-testid="cal" calendar={'hebrew' as 'gregory'} locale="en-US" defaultMonth={new Date(2026, 10, 15)} />);
    expect([title(), inMonth()[0]!.dataset.date]).toEqual(['November 2026', '2026-11-01']);
    expect(warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('calendar-system'))).toHaveLength(1);
    warn.mockRestore();
  });
  test('headingLevel sets the month title\'s level to fit the page\'s outline: 2 by default, 2 to 6 taken, anything else 2', async () => {
    const r = await render(<Calendar data-testid="cal" locale="en-US" defaultMonth={new Date(2026, 10, 1)} />);
    const level = () => page.getByRole('heading', { name: 'November 2026' }).element().tagName;
    expect(level()).toBe('H2');
    await r.rerender(<Calendar data-testid="cal" locale="en-US" defaultMonth={new Date(2026, 10, 1)} headingLevel={4} />);
    expect([level(), page.getByRole('grid').element().getAttribute('aria-labelledby') === page.getByRole('heading', { name: 'November 2026' }).element().id]).toEqual(['H4', true]);
    await r.rerender(<Calendar data-testid="cal" locale="en-US" defaultMonth={new Date(2026, 10, 1)} headingLevel={9 as 2} />);
    expect(level()).toBe('H2');
  });
});
