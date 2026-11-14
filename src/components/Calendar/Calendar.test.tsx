import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, forcedColors, iconPoints, press } from '../../../tools/test/vitest/helpers';
import { Calendar, type CalendarProps } from './Calendar';

const q = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const cal = <T extends HTMLElement = HTMLElement>(sel: string) => q<T>(`[data-testid=cal] ${sel}`);
const focused = () => { const a = document.activeElement as HTMLElement; return a.dataset.date || a.id || a.tagName; };
const title = () => cal('.dk-calendar__title').textContent;

// The script's main calendar: March 2025, Sunday weeks, min Feb 3, max Jun 20, March Sundays refused.
function Cal(props: { picks?: string[]; months?: string[]; cref?: React.Ref<HTMLDivElement> } & Partial<CalendarProps>) {
  const { picks = [], months = [], cref, ...rest } = props;
  return <Calendar data-testid="cal" locale="en-US" weekStartsOn={0} defaultMonth={new Date(2025, 2, 10)} defaultValue={new Date(2025, 2, 10)} className="extra" ref={cref}
    min={new Date(2025, 1, 3)} max={new Date(2025, 5, 20)} isDateDisabled={(d) => d.getDay() === 0 && d.getMonth() === 2}
    onValueChange={(d) => { picks.push(d.toDateString()); }} onMonthChange={(m) => { months.push(m.toDateString()); }} {...rest} />;
}

const modified = (t: Element, key = 'ArrowRight') => ['altKey', 'ctrlKey', 'metaKey'].map((m) => { const ev = new KeyboardEvent('keydown', { key, [m]: true, bubbles: true, cancelable: true }); t.dispatchEvent(ev); return ev.defaultPrevented; });

describe('Calendar', () => {
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
    await render(<div data-testid="cal"><Calendar value="2026-10-14" min="2026-10-10" max="2026-10-20" onValueChange={(d, iso) => picks.push(d.getHours() + ':' + d.getDate() + ' ' + iso)} /></div>);
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
    expect([cal('.dk-calendar__nav--prev [data-icon]'), cal('.dk-calendar__nav--next [data-icon]')].map(iconPoints)).toEqual(['right', 'left']);
  });

  test('de-DE: German names and weeks starting on Monday', async () => {
    await render(<Calendar data-testid="de" locale="de-DE" defaultMonth={new Date(2025, 2, 1)} />);
    const de = [...document.querySelectorAll('[data-testid=de] th [aria-hidden]')].map((x) => x.textContent).join() + ' ' + q('[data-testid=de] .dk-calendar__title').textContent;
    expect(de).toMatch(/^Mo\.?,Di\.?,Mi\.?,Do\.?,Fr\.?,Sa\.?,So\.? März 2025$/);
  });

  test('th, fa, ja-u-ca-japanese, ar-EG: the title and day labels name the Gregorian month shown in the grid, with localized month names', async () => {
    await render(<>{['th', 'fa', 'ja-u-ca-japanese', 'ar-EG'].map((l) => <Calendar key={l} data-testid={l} locale={l} defaultMonth={new Date(2025, 10, 1)} />)}</>);
    for (const l of ['th', 'fa', 'ja-u-ca-japanese', 'ar-EG']) {
      const t = q(`[data-testid="${l}"] .dk-calendar__title`).textContent;
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

  test('min: days before it are aria-disabled and the previous button stops at its month; isDateDisabled: refused days are aria-disabled, faded and can\'t be picked; max: the next button stops at its month', async () => {
    const picks: string[] = [];
    await render(<Cal picks={picks} defaultMonth={new Date(2025, 3, 1)} />);
    await userEvent.click(cal('button[aria-label="Previous month"]'));
    await userEvent.click(cal('button[aria-label="Previous month"]'));
    expect([title(), cal<HTMLButtonElement>('.dk-calendar__nav--prev').disabled]).toEqual(['February 2025', true]);
    expect([cal('[data-date="2025-02-02"]').getAttribute('aria-disabled'), cal('[data-date="2025-02-03"]').getAttribute('aria-disabled')]).toEqual(['true', null]);
    await userEvent.click(cal('button[aria-label="Next month"]'));
    await userEvent.click(cal('[data-date="2025-03-16"]'), { force: true });
    expect([cal('[data-date="2025-03-16"]').getAttribute('aria-disabled'), picks.length]).toEqual(['true', 0]);
    await expect.poll(() => getComputedStyle(cal('[data-date="2025-03-16"]')).opacity).toBe('0.5');
    for (let i = 0; i < 3; i++) await userEvent.click(cal('button[aria-label="Next month"]'));
    expect([title(), cal<HTMLButtonElement>('.dk-calendar__nav--next').disabled]).toEqual(['June 2025', true]);
  });

  test('--calendar-bg-selected and --calendar-color-selected override one calendar; the old names, state first (--calendar-selected-bg), still work until 15.0.0', async () => {
    await render(<>
      <Calendar data-testid="tok" style={{ '--calendar-bg-selected': 'rgb(1, 2, 3)', '--calendar-color-selected': 'rgb(4, 5, 6)' } as React.CSSProperties} defaultValue={new Date(2025, 2, 10)} weekStartsOn={0} />
      <Calendar data-testid="tok-old" style={{ '--calendar-selected-bg': 'rgb(1, 2, 3)', '--calendar-selected-color': 'rgb(4, 5, 6)' } as React.CSSProperties} defaultValue={new Date(2025, 2, 10)} weekStartsOn={0} />
    </>);
    const look = (id: string) => { const c = getComputedStyle(q(`[data-testid=${id}] .dk-calendar__day--selected`)); return `${c.backgroundColor} / ${c.color}`; };
    await expect.poll(() => look('tok')).toBe('rgb(1, 2, 3) / rgb(4, 5, 6)');
    await expect.poll(() => look('tok-old')).toBe('rgb(1, 2, 3) / rgb(4, 5, 6)');
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
    expect(cal('.dk-calendar__title').getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(cal('.dk-calendar__header').getBoundingClientRect().width).toBeLessThanOrEqual(cal('.dk-calendar__grid').getBoundingClientRect().width + 1);
    expect(cal('.dk-calendar__header').scrollWidth).toBeLessThanOrEqual(cal('.dk-calendar__header').clientWidth);
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
        expect([...r.host.querySelectorAll('button')].filter((b) => b.classList.contains('dk-calendar__day--today')).map((b) => b.dataset.date)).toEqual(['2026-11-08']);
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
    await render(<Calendar id="cp" locale="en-US" presets max={max} onValueChange={(_d, s) => got.push(s)} />);
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
  test('today keeps 4.5:1 on the hover fill in all six themes, as do the other days', async () => {
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
