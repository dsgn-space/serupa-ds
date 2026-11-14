import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render as draw } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, color, press } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { EventCalendar, type CalendarEvent } from './EventCalendar';

// The tests read dates and times as English writes them; the second-language runs would write them otherwise.
const EnUS = ({ children }: { children: React.ReactNode }) => <SerupaProvider locale="en-US">{children}</SerupaProvider>;
const render = (ui: React.ReactNode) => draw(ui, { wrapper: EnUS });
const el = (id: string) => document.getElementById(id) as HTMLElement;
const cell = (d: string) => document.querySelector<HTMLElement>(`td[data-date="${d}"]`)!;
const names = (d: string) => [...cell(d).querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent);
const MARCH = new Date(2025, 2, 1);
const EVENTS: CalendarEvent[] = [
  { id: 'a', title: 'Team standup', start: '2025-03-04T09:30', end: '2025-03-04T09:45', repeating: true },
  { id: 'b', title: 'Design review', start: '2025-03-04T14:00', end: '2025-03-04T15:00', tone: 'info' },
  { id: 'c', title: 'Launch day', start: '2025-03-12', allDay: true, tone: 'success' },
  { id: 'd', title: 'Offsite', start: '2025-03-18', end: '2025-03-20', allDay: true },
];

describe('EventCalendar', () => {
  test('a <div> with a toolbar and a grid named by its month; ref, className and other props reach the div', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<EventCalendar id="x" ref={ref} className="extra" data-x="y" events={EVENTS} defaultMonth={MARCH} weekStartsOn={0} />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', true, 'dk-event-calendar extra', 'y', 'event-calendar']);
    await expect.element(page.getByRole('grid', { name: 'March 2025' })).toBeInTheDocument();
    await expect.element(page.getByRole('heading', { level: 2, name: 'March 2025' })).toBeInTheDocument();
    expect(document.querySelectorAll('tbody tr')).toHaveLength(6);   // Feb 23 to Apr 5: March 2025 reaches six weeks
  });

  test('a time is written with the hour unpadded in every engine, as the server writes it ("9.30", not Firefox\'s "09.30" for id-ID)', async () => {
    // As Firefox does for some 24-hour locales: the hour two digits wide though 'numeric' was asked for.
    const parts = Intl.DateTimeFormat.prototype.formatToParts;
    const padded = function (this: Intl.DateTimeFormat, d?: Date | number) {
      return parts.call(this, d).map((x) => (x.type === 'hour' && this.resolvedOptions().hour === 'numeric' ? { ...x, value: x.value.padStart(2, '0') } : x));
    };
    const toParts = vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockImplementation(padded);
    // format is a getter that hands back a bound function.
    const format = vi.spyOn(Intl.DateTimeFormat.prototype as unknown as { format: object }, 'format', 'get').mockImplementation(function (this: Intl.DateTimeFormat) { return (d?: Date | number) => padded.call(this, d).map((x) => x.value).join(''); });
    try {
      await draw(<EventCalendar events={EVENTS} defaultMonth={MARCH} locale="id-ID" />);
      expect(names('2025-03-04')[0]).toMatch(/^9\.30 Team standup, .*, 9\.30 to 9\.45, /);
    } finally { toParts.mockRestore(); format.mockRestore(); }
  });

  test('each day is named by its date and its events; events are buttons named by title, time and Repeats, in order', async () => {
    await render(<EventCalendar events={EVENTS} defaultMonth={MARCH} />);
    expect(cell('2025-03-04').textContent).toMatch(/^Tuesday, March 4, 2025, 2 events/);
    expect(cell('2025-03-05').textContent).toMatch(/^Wednesday, March 5, 2025, No events/);
    expect(names('2025-03-04')).toEqual(['9:30 AM Team standup, Tuesday, March 4, 9:30 AM to 9:45 AM, Repeats', '2:00 PM Design review, Tuesday, March 4, 2:00 PM to 3:00 PM']);
    expect(names('2025-03-12')).toEqual(['Launch day, Wednesday, March 12, All day']);
    // A three-day event shows on each of its days.
    expect(['2025-03-18', '2025-03-19', '2025-03-20', '2025-03-21'].map((d) => names(d).length)).toEqual([1, 1, 1, 0]);
  });

  test('keyboard: one Tab stop on the days, arrows and PageDown move it, Tab goes to the day\'s events, Escape back', async () => {
    const months: string[] = [];
    await render(<EventCalendar events={EVENTS} defaultMonth={MARCH} weekStartsOn={0} onMonthChange={(m) => months.push(m.toDateString())} />);
    const stops = () => [...document.querySelectorAll('td[tabindex="0"]')];
    expect(stops()).toHaveLength(1);
    cell('2025-03-01').focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(document.activeElement).toBe(cell('2025-03-10'));
    await userEvent.keyboard('{ArrowUp}{ArrowRight}');
    expect(document.activeElement).toBe(cell('2025-03-04'));
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement!.getAttribute('aria-label')).toBe('9:30 AM Team standup, Tuesday, March 4, 9:30 AM to 9:45 AM, Repeats');
    await userEvent.keyboard('{Escape}');
    expect(document.activeElement).toBe(cell('2025-03-04'));
    await userEvent.keyboard('{PageDown}');
    expect(document.activeElement).toBe(cell('2025-04-04'));
    expect(months).toEqual([new Date(2025, 3, 1).toDateString()]);
    await expect.element(page.getByRole('grid', { name: 'April 2025' })).toBeInTheDocument();
    await userEvent.keyboard('{PageUp}');
    expect(document.activeElement).toBe(cell('2025-03-04'));
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(cell('2025-03-02'));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(cell('2025-03-08'));
  });

  test('keyboard: with a controlled month the app shows a moment later, focus waits for the new month\'s day (GR206)', async () => {
    function Late() {
      const [month, setMonth] = React.useState(MARCH);
      return <EventCalendar events={EVENTS} month={month} weekStartsOn={0} onMonthChange={(m) => { setTimeout(() => setMonth(m), 100); }} />;
    }
    await render(<Late />);
    cell('2025-03-12').focus();   // April 12 isn't in March's grid
    await userEvent.keyboard('{PageDown}');
    // Before April shows, the grid keeps one Tab stop.
    expect(document.querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
    await vi.waitFor(() => expect(document.activeElement).toBe(cell('2025-04-12')));
    await expect.element(page.getByRole('grid', { name: 'April 2025' })).toBeInTheDocument();
  });

  test('the days of the months before and after show their dates but not their events, as the README says (GR207)', async () => {
    await render(<EventCalendar events={[...EVENTS, { id: 'e', title: 'Planning', start: '2025-04-02T10:00', end: '2025-04-02T11:00' }]} defaultMonth={MARCH} weekStartsOn={0} />);
    expect(cell('2025-04-02').querySelectorAll('button')).toHaveLength(0);
    expect(cell('2025-04-02').textContent).toMatch(/^Wednesday, April 2, 2025, No events/);
  });

  test('at 360px the agenda shows an event over midnight and a long title whole, without scrolling sideways (GR208)', async () => {
    const [w, h] = [window.innerWidth, window.innerHeight];
    await page.viewport(360, 700);
    try {
      await render(<EventCalendar id="cal" defaultMonth={MARCH} events={[
        { id: 'n', title: 'Release night', start: '2025-03-21T22:00', end: '2025-03-22T02:00' },
        { id: 'l', title: 'Design review with the whole platform group', start: '2025-03-24T14:00', end: '2025-03-24T15:00' },
      ]} />);
      await expect.element(page.getByText('Release night').first()).toBeInTheDocument();
      expect(document.querySelector('[role=grid]')).toBeNull();   // below 640px the month shows as the agenda
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
      const right = el('cal').getBoundingClientRect().right;
      // Each event's time and title (the button's spans).
      for (const t of [...el('cal').querySelectorAll<HTMLElement>('li button')].flatMap((b) => [...b.querySelectorAll<HTMLElement>('span')])) {
        expect(Math.floor(t.getBoundingClientRect().right)).toBeLessThanOrEqual(Math.ceil(right));
        expect(t.scrollWidth).toBeLessThanOrEqual(t.clientWidth + 1);   // nothing cut off
      }
    } finally {
      await page.viewport(w, h);
    }
  });

  test('the server\'s HTML marks no day as today and puts the Tab stop on the 1st: its today may not be the reader\'s (GR210)', () => {
    const html = renderToString(<EnUS><EventCalendar events={EVENTS} /></EnUS>);
    expect(html).not.toContain('aria-current');
    const now = new Date(), first = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
    expect(html).toMatch(new RegExp('tabindex="0"[^>]*data-date="' + first + '"|data-date="' + first + '"[^>]*tabindex="0"'));
  });

  test('hydrated on the 1st from a server still on the 31st: no mismatch, then the visitor\'s month, said to onMonthChange (GR396)', async () => {
    const { hydrateRoot } = await import('react-dom/client');
    const { flushSync } = await import('react-dom');
    const months: string[] = [];
    const ui = <EnUS><EventCalendar events={[]} onMonthChange={(m) => months.push(m.toDateString())} /></EnUS>;
    vi.useFakeTimers({ toFake: ['Date'] });
    const host = document.createElement('div');
    const errors: string[] = [], logError = console.error;
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      vi.setSystemTime(new Date(2026, 9, 31, 22, 0));
      host.innerHTML = renderToString(ui);
      document.body.appendChild(host);
      expect(host.querySelector('h2')!.textContent).toBe('October 2026');
      vi.setSystemTime(new Date(2026, 10, 1, 5, 0));
      console.error = (...a: unknown[]) => { errors.push(a.map(String).join(' ')); };
      flushSync(() => { root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) }); });
      await new Promise((r) => setTimeout(r, 30));
      expect(errors).toEqual([]);
      expect(host.querySelector('h2')!.textContent).toBe('November 2026');
      expect([...host.querySelectorAll('[aria-current="date"]')].map((e) => (e as HTMLElement).dataset.date)).toEqual(['2026-11-01']);
      expect(months).toEqual([new Date(2026, 10, 1).toDateString()]);
    } finally { console.error = logError; vi.useRealTimers(); root?.unmount(); host.remove(); }
  });

  test('a client render with no month opens on today\'s month and calls nothing', async () => {
    const months: Date[] = [];
    await render(<EventCalendar id="c" events={[]} onMonthChange={(m) => months.push(m)} />);
    const now = new Date();
    expect([el('c').querySelector('h2')!.dataset.month, months.length]).toEqual([now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01', 0]);
  });

  test('keyboard: Enter and Space on an event open it', async () => {
    const opened: string[] = [];
    await render(<EventCalendar events={EVENTS} defaultMonth={MARCH} weekStartsOn={0} onEventClick={(e) => opened.push(e.id)} />);
    cell('2025-03-04').focus();
    await userEvent.keyboard('{Tab}{Enter}');
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard(' ');
    expect(opened).toEqual(['a', 'b']);
  });

  test('Previous, Next and Today change the month, said through the title (a polite live region)', async () => {
    await render(<EventCalendar events={[]} defaultMonth={MARCH} />);
    const title = document.querySelector('h2')!;
    expect(title.getAttribute('aria-live')).toBe('polite');
    await userEvent.click(page.getByRole('button', { name: 'Next month' }));
    expect(title.textContent).toBe('April 2025');
    await userEvent.click(page.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(page.getByRole('button', { name: 'Previous month' }));
    expect(title.textContent).toBe('February 2025');
    await userEvent.click(page.getByRole('button', { name: 'Today' }));
    expect(title.textContent).toBe(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()));
  });

  test('onEventClick gets the event; past maxPerDay, "+N more" opens a Popover with all of the day\'s events', async () => {
    const clicked = vi.fn();
    const busy: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({ id: 'e' + i, title: 'Call ' + (i + 1), start: `2025-03-06T1${i}:00` }));
    await render(<EventCalendar events={busy} defaultMonth={MARCH} maxPerDay={3} onEventClick={clicked} />);
    expect(names('2025-03-06')).toEqual(['10:00 AM Call 1, Thursday, March 6', '11:00 AM Call 2, Thursday, March 6', '+3 more']);
    cell('2025-03-06').focus();
    await userEvent.click(page.getByRole('button', { name: '11:00 AM Call 2, Thursday, March 6' }));
    expect(clicked).toHaveBeenCalledWith(busy[1]);
    await userEvent.click(page.getByRole('button', { name: '+3 more' }));
    const dialog = page.getByRole('dialog', { name: 'Thursday, March 6, 2025' });
    await expect.element(dialog).toBeVisible();
    expect([...dialog.element().querySelectorAll('button[data-event-id]')].map((b) => b.getAttribute('data-event-id'))).toEqual(['e0', 'e1', 'e2', 'e3', 'e4']);
  });

  test('agenda: the days with events in a list, each under a heading; the switch changes the view; an empty month says so', async () => {
    const views: string[] = [];
    const { rerender } = await render(<EventCalendar events={EVENTS} defaultMonth={MARCH} onViewChange={(v) => views.push(v)} />);
    await userEvent.click(page.getByRole('radio', { name: 'Agenda' }));
    expect(views).toEqual(['agenda']);
    const days = [...document.querySelectorAll('ol > li h3')].map((h) => h.textContent);
    expect(days).toEqual(['Tuesday, March 4, 2025', 'Wednesday, March 12, 2025', 'Tuesday, March 18, 2025', 'Wednesday, March 19, 2025', 'Thursday, March 20, 2025']);
    await expect.element(page.getByRole('button', { name: '2:00 PM to 3:00 PM Design review, Tuesday, March 4' })).toBeInTheDocument();
    await rerender(<EnUS><EventCalendar events={[]} defaultMonth={MARCH} view="agenda" /></EnUS>);
    await expect.element(page.getByText('No events this month')).toBeInTheDocument();
    await rerender(<EnUS><EventCalendar events={EVENTS} defaultMonth={MARCH} view="month" /></EnUS>);
    await expect.element(page.getByRole('grid', { name: 'March 2025' })).toBeInTheDocument();
  });

  test('agenda: today is marked by more than colour, an underline, which forced colours keep (GR289)', async () => {
    const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() === 1 ? 2 : 1);
    const at = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    await render(<EventCalendar events={[{ id: 't', title: 'Now', start: at(now), allDay: true }, { id: 'o', title: 'Other', start: at(next), allDay: true }]} view="agenda" />);
    const today = document.querySelector<HTMLElement>('li[aria-current="date"] h3')!, other = [...document.querySelectorAll<HTMLElement>('ol > li:not([aria-current]) h3')];
    expect(other).toHaveLength(1);
    expect(css(today).textDecorationLine).toBe('underline');
    expect(css(other[0]!).textDecorationLine).toBe('none');
  });

  test('week: the week\'s days side by side, named by the week; Previous and Next move a week, and say it', async () => {
    const months: Date[] = [];
    await render(<EventCalendar id="wk" events={EVENTS} defaultMonth={new Date(2025, 2, 4)} defaultView="week" weekStartsOn={0} onMonthChange={(m) => months.push(m)} />);
    await expect.element(page.getByRole('grid', { name: 'March 2 – 8, 2025' })).toBeInTheDocument();
    expect([...document.querySelectorAll('[role=gridcell]')].map((c) => c.getAttribute('data-date'))).toEqual(['2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07', '2025-03-08']);
    expect(cell('2025-03-04').textContent).toMatch(/^Tuesday, March 4, 2025, 2 events/);
    expect(names('2025-03-04')).toEqual(['9:30 AM Team standup, Tuesday, March 4, 9:30 AM to 9:45 AM, Repeats', '2:00 PM Design review, Tuesday, March 4, 2:00 PM to 3:00 PM']);
    // The day's Tab stop is the day it opened on.
    expect(cell('2025-03-04').tabIndex).toBe(0);
    await userEvent.click(page.getByRole('button', { name: 'Next week' }));
    await expect.element(page.getByRole('heading', { level: 2, name: 'March 9 – 15, 2025' })).toBeInTheDocument();
    expect(names('2025-03-12')).toEqual(['Launch day, Wednesday, March 12, All day']);
    for (let i = 0; i < 3; i++) await userEvent.click(page.getByRole('button', { name: 'Next week' }));
    // Into April: the week that holds both months, and the month is said once it changes.
    await expect.element(page.getByRole('heading', { level: 2, name: 'March 30 – April 5, 2025' })).toBeInTheDocument();
    expect(months.map((m) => m.getMonth())).toEqual([3]);
    await userEvent.click(page.getByRole('button', { name: 'Previous week' }));
    await expect.element(page.getByRole('heading', { level: 2, name: 'March 23 – 29, 2025' })).toBeInTheDocument();
    expect(months.map((m) => m.getMonth())).toEqual([3, 2]);
  });

  test('week: an event takes its time\'s place and length; events that overlap share the width side by side; all-day events sit on top', async () => {
    await render(<EventCalendar id="wk" defaultMonth={new Date(2025, 2, 18)} defaultView="week" weekStartsOn={0} events={[
      { id: 'o', title: 'Offsite', start: '2025-03-18', allDay: true },
      { id: 'l', title: 'Lunch', start: '2025-03-18T12:00', end: '2025-03-18T13:00' },
      { id: 'd', title: 'Demo', start: '2025-03-18T15:00', end: '2025-03-18T16:00' },
      { id: 'c', title: 'Call', start: '2025-03-18T15:30', end: '2025-03-18T16:30' },
      { id: 'q', title: 'Quick sync', start: '2025-03-18T17:00', end: '2025-03-18T17:05' },
    ]} />);
    const box = (t: string) => page.getByRole('button', { name: new RegExp('^\\S+ \\S+ ' + t + ',|^' + t + ',') }).element().getBoundingClientRect();
    const day = cell('2025-03-18').getBoundingClientRect(), lunch = box('Lunch'), demo = box('Demo'), call = box('Call'), quick = box('Quick sync'), all = box('Offsite');
    // An hour is 48px: lunch is an hour tall, three hours above the demo.
    expect([Math.round(lunch.height), Math.round(demo.top - lunch.top)]).toEqual([46, 144]);
    // The demo and the call overlap: half the day's width each, the call beside the demo, half an hour lower.
    expect([Math.round(demo.width) <= Math.round(day.width / 2), Math.round(call.left) >= Math.round(demo.right), Math.round(call.top - demo.top)]).toEqual([true, true, 24]);
    // Lunch overlaps nothing: the day's whole width. Five minutes still get half an hour, and a 24px target.
    expect([Math.round(lunch.width) > Math.round(day.width / 2), Math.round(quick.height)]).toEqual([true, 24]);
    expect(all.bottom).toBeLessThanOrEqual(lunch.top);
  });

  test('week: the hours scroll in their box, opened at 8 AM (or the first event), under the weekday names and the all-day row', async () => {
    const { rerender } = await render(<EventCalendar defaultMonth={new Date(2025, 2, 4)} defaultView="week" weekStartsOn={0} events={EVENTS} />);
    const grid = page.getByRole('grid').element(), box = grid.parentElement!;
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight);
    const head = grid.querySelector('th')!.getBoundingClientRect();
    const eight = page.getByRole('grid').element().querySelector('[data-hour="8"]')!.getBoundingClientRect();
    // The 8 AM line is just under what's pinned: the weekday names and the (empty) all-day row.
    expect(eight.top - head.bottom).toBeGreaterThan(0);
    expect(eight.top - head.bottom).toBeLessThan(16);
    box.scrollTop += 200;
    await new Promise((r) => requestAnimationFrame(r));
    expect(Math.round(grid.querySelector('th')!.getBoundingClientRect().top)).toBe(Math.round(box.getBoundingClientRect().top) + 1);
    // An event at 6 AM opens the hours there instead.
    await rerender(<EnUS><EventCalendar defaultMonth={new Date(2025, 2, 4)} defaultView="day" events={[{ id: 'e', title: 'Early flight', start: '2025-03-04T06:00', end: '2025-03-04T07:00' }]} /></EnUS>);
    await expect.element(page.getByRole('grid', { name: 'Tuesday, March 4, 2025' })).toBeInTheDocument();
    const g = page.getByRole('grid').element(), six = g.querySelector('[data-hour="6"]')!.getBoundingClientRect(), h2 = g.querySelector('th')!.getBoundingClientRect();
    expect(six.top - h2.bottom).toBeGreaterThan(0);
    expect(six.top - h2.bottom).toBeLessThan(16);
  });

  test('day: one day, named by its date; Previous and Next move a day; the keys move it a day, PageDown a day too', async () => {
    await render(<EventCalendar id="dy" events={EVENTS} defaultMonth={new Date(2025, 2, 4)} defaultView="day" />);
    await expect.element(page.getByRole('grid', { name: 'Tuesday, March 4, 2025' })).toBeInTheDocument();
    expect(document.querySelectorAll('[role=gridcell]')).toHaveLength(1);
    await userEvent.click(page.getByRole('button', { name: 'Next day' }));
    await expect.element(page.getByRole('heading', { level: 2, name: 'Wednesday, March 5, 2025' })).toBeInTheDocument();
    await userEvent.click(page.getByRole('button', { name: 'Previous day' }));
    cell('2025-03-04').focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2025-03-05');
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2025-03-06');
    await userEvent.keyboard('{PageUp}');
    await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2025-03-05');
  });

  test('week: the keys move a day, PageDown a week; the switch offers Month, Week, Day and Agenda', async () => {
    const views: string[] = [];
    await render(<EventCalendar events={EVENTS} defaultMonth={new Date(2025, 2, 4)} weekStartsOn={0} onViewChange={(v) => views.push(v)} />);
    expect([...document.querySelectorAll('[role=radio]')].map((r) => r.textContent)).toEqual(['Month', 'Week', 'Day', 'Agenda']);
    await userEvent.click(page.getByRole('radio', { name: 'Week' }));
    await userEvent.click(page.getByRole('radio', { name: 'Day' }));
    await userEvent.click(page.getByRole('radio', { name: 'Week' }));
    expect(views).toEqual(['week', 'day', 'week']);
    cell('2025-03-04').focus();
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2025-03-11');
    await expect.element(page.getByRole('heading', { level: 2, name: 'March 9 – 15, 2025' })).toBeInTheDocument();
    await userEvent.keyboard('{End}');
    await expect.poll(() => document.activeElement?.getAttribute('data-date')).toBe('2025-03-15');
  });

  test('week: today has a line at the time now that moves with the clock, and the time zone shows over the hours', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'], now: new Date(2025, 2, 4, 10, 0) });
    try {
      await render(<EventCalendar events={EVENTS} defaultView="week" weekStartsOn={0} />);
      const line = () => cell('2025-03-04').querySelector<HTMLElement>('[aria-hidden]:not(span)')!;
      const hours = () => line().parentElement!.getBoundingClientRect().top;
      await expect.poll(() => Math.round(line().getBoundingClientRect().top - hours())).toBe(480);
      vi.advanceTimersByTime(30 * 60000);
      await expect.poll(() => Math.round(line().getBoundingClientRect().top - hours())).toBe(504);
      expect(cell('2025-03-05').querySelector('[aria-hidden]:not(span)')).toBeNull();
      const zone = page.getByRole('grid').element().querySelector('thead td')!;
      expect([zone.getAttribute('aria-hidden'), zone.textContent.length > 0]).toEqual(['true', true]);
    } finally { vi.useRealTimers(); }
  });

  test('below 640px the week shows as the agenda, which fits a phone; the day stays a day', async () => {
    const [w, h] = [window.innerWidth, window.innerHeight];
    await page.viewport(360, 700);
    try {
      const { rerender } = await render(<EventCalendar events={EVENTS} defaultMonth={new Date(2025, 2, 4)} view="week" />);
      await expect.element(page.getByText('Design review').first()).toBeInTheDocument();
      expect(document.querySelector('[role=grid]')).toBeNull();
      await rerender(<EnUS><EventCalendar events={EVENTS} defaultMonth={new Date(2025, 2, 4)} view="day" /></EnUS>);
      await expect.element(page.getByRole('grid', { name: 'Tuesday, March 4, 2025' })).toBeInTheDocument();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
    } finally {
      await page.viewport(w, h);
    }
  });

  test('its text reads 4.5:1 on its background, and an event\'s on each tone, in all six themes', async () => {
    await render(<EventCalendar id="c" events={EVENTS} defaultMonth={MARCH} />);
    const bg = () => css(el('c')).backgroundColor;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, bg()), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(document.querySelector('th')).color, bg()), th + ' weekday').toBeGreaterThanOrEqual(4.5);
      for (const b of document.querySelectorAll<HTMLElement>('button[data-event-id]')) expect(contrast(css(b).color, css(b).backgroundColor), th + ' ' + b.className).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('EventCalendar and the screen width', () => {
  test('a re-render reads the width without making a new media query each time (one shared list per query)', async () => {
    const screen = await render(<EventCalendar events={EVENTS} defaultMonth={MARCH} />);
    const spy = vi.spyOn(window, 'matchMedia');
    try {
      for (let k = 0; k < 3; k++) await screen.rerender(<EventCalendar events={EVENTS} defaultMonth={MARCH} maxPerDay={k + 2} />);
      expect(spy).not.toHaveBeenCalled();
    } finally { spy.mockRestore(); }
  });
});

describe('EventCalendar labels', () => {
  test('eventCount and moreEvents say the count as given, in the locale\'s digits ("٢ acara", "+٣ lagi")', () => {
    expect([idLabels.eventCount(2, '٢'), idLabels.moreEvents(3, '٣'), idLabels.eventCount(0, '٠')]).toEqual(['٢ acara', '+٣ lagi', 'Tidak ada acara']);
  });
});

describe('EventCalendar held state', () => {
  test('held down: "+N more" fills one step past its hover (--event-calendar-more-bg-pressed), and its text or icon keeps 4.5:1 on it in all six themes', async () => {
    await render(<EventCalendar events={Array.from({ length: 5 }, (_, i) => ({ id: 'e' + i, title: 'Call ' + (i + 1), start: `2025-03-06T1${i}:00` }))} defaultMonth={MARCH} maxPerDay={3} />);
    const b = page.getByRole('button', { name: '+3 more' }).element() as HTMLElement;
    const f = () => b;
    const low = await press(b, async () => {
      await expect.poll(() => css(f()).backgroundColor).toBe(color('var(--pressed)'));
      const out: string[] = [];
      for (const th of THEMES) {
        document.documentElement.setAttribute('data-theme', th);
        const r = contrast(css(f()).color, css(f()).backgroundColor);
        if (r < 4.5) out.push(`${th}: ${r.toFixed(2)}`);
      }
      document.documentElement.removeAttribute('data-theme');
      return out;
    });
    expect(low).toEqual([]);
  });
  test('times read the same in every engine: a narrow space before AM (older Chrome and Safari) is written as the plain one Node writes, so server text hydrates', async () => {
    const parts = Intl.DateTimeFormat.prototype.formatToParts;
    const spy = vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockImplementation(function (this: Intl.DateTimeFormat, d?: Date | number) {
      return parts.call(this, d).map((x) => (x.type === 'literal' ? { ...x, value: x.value.replace(/ /g, '\u202f') } : x));
    });
    try {
      const html = renderToString(<EnUS><EventCalendar events={EVENTS} defaultMonth={MARCH} /></EnUS>);
      expect(html).not.toMatch(/[\u2009\u202f]/);
      expect(html).toContain('9:30 AM');
    } finally { spy.mockRestore(); }
  });
});
