import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render as draw } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
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
