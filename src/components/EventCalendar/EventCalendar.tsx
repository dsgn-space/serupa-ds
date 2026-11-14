'use client';
import * as React from 'react';
import { cn, domId, omit, useIsoLayoutEffect } from '../../internal/cn';
import { useBreakpoint } from '../../internal/media';
import { component } from '../../internal/component';
import { addDays, addMonths, compare, day, firstDayOfWeek, isValid, sameDay, sameMonth, startOfMonth, startOfWeek } from '../../internal/dates';
import { useLocale, useOwnLang, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { minuteTick } from '../../internal/timing';
import { announce } from '../../internal/announce';
import { useServerStyles } from '../../internal/serverStyles';
import * as icons from '../../material/builtin';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Popover } from '../Popover/Popover';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { en as CalendarWords } from '../Calendar/labels';
import { en as EventCalendarWords } from './labels';
// Its own words and the month buttons' names it shares with Calendar.
const words = /* @__PURE__ */ Object.assign({}, EventCalendarWords, CalendarWords);

/* A time with the hour as 'numeric' asks: "9.30", not "09.30". Engines differ for some 24-hour locales (Firefox writes
   id-ID as "09.30", Chromium and Node as "9.30"), and the server's HTML has to match what the browser renders. */
function numericHour(f: Intl.DateTimeFormat): { format: (d: Date) => string } {
  // A narrow or thin space ("9:30\u202fAM" in Chrome before 124 and older Safari, a plain one in Node and newer
  // browsers) is written as a plain space, so the server's text and the browser's match on hydration.
  return { format: (d) => f.formatToParts(d).map((x) => (x.type === 'hour' ? x.value.replace(/^0(?=\d)/, '') : x.value.replace(/[\u2009\u202f]/g, ' '))).join('') };
}

/** One event. The app expands repeating events into their occurrences and marks them with repeating. */
export interface CalendarEvent {
  /** Unique among the events: the key, and what onEventClick hands back with the event. */
  id: string;
  /** What it is, shown on the day and read first. */
  title: string;
  /** When it starts: a Date, or an ISO string ("2025-03-04T10:00", or "2025-03-04" for a whole day). */
  start: Date | string;
  /** When it ends, as start. An event that runs past midnight shows on each of its days. Default: start. */
  end?: Date | string | undefined;
  /** Takes the whole day (or days): shown first, without a time. A "yyyy-mm-dd" start is all day too. */
  allDay?: boolean | undefined;
  /** One occurrence of a repeating event: "Repeats" is said after its time, and a mark shows it. */
  repeating?: boolean | undefined;
  /** Its color, beside its title (the meaning is in the title, never the color alone). Default: 'primary'. */
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | undefined;
}

/** EventCalendar's views. */
export type EventCalendarView = 'month' | 'week' | 'day' | 'agenda';
const VIEWS: readonly string[] = ['month', 'week', 'day', 'agenda'];
const isView = (v: unknown): v is EventCalendarView => typeof v === 'string' && VIEWS.includes(v);

export interface EventCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue'> {
  /** The events to show. Those in the shown month (or week, or day) are drawn. */
  events: readonly CalendarEvent[];
  /** Called when an event is clicked, or pressed with Enter or Space, with the event: open its details from here. */
  onEventClick?: ((event: CalendarEvent) => void) | undefined;
  /** The month shown (controlled): any day in it. Use with onMonthChange. */
  month?: Date | undefined;
  /** The month shown at first: any day in it. The week and day views open on that day's week, or that day. Default: today's. */
  defaultMonth?: Date | undefined;
  /** Called with the month's first day when Previous, Next, Today or the keyboard changes it. */
  onMonthChange?: ((month: Date) => void) | undefined;
  /** 'month' (a grid of weeks), 'week' or 'day' (the days' hours, with the events placed at their times) or 'agenda'
   *  (a list of the days with events), controlled. Use with onViewChange. */
  view?: EventCalendarView | undefined;
  /** The view at first. Default: 'month'. Below 640px wide the month and the week show as the agenda, which fits a phone; the day stays. */
  defaultView?: EventCalendarView | undefined;
  /** Called when the view switch changes the view. */
  onViewChange?: ((view: EventCalendarView) => void) | undefined;
  /** The most a day shows; past it, the last place shows "+N more", which opens all of them. Default: 3. */
  maxPerDay?: number | undefined;
  /** A BCP 47 locale for month, weekday and time names and the first day of the week. Default: the nearest SerupaProvider's locale, else the browser's. */
  locale?: string | undefined;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
  /** The month title's heading level, 2 (default) to 6, to fit the page's outline. The agenda's days are one below it. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Called when an empty time is chosen to add an event: a press on a day's empty space (in the month, the whole
   *  day; in the week and day views, the hour from the half hour pressed), a drag down a day's hours (by quarter
   *  hours), or Enter or Space on a day (the whole day). Open your form for a new event from here. */
  onSlotSelect?: ((slot: CalendarSlot) => void) | undefined;
  /** Called when an event is dragged to another day or time, its end dragged in the week and day views, or it's moved
   *  with Shift and the arrow keys, with the event and its new times. Given, events can be moved: update events with
   *  the new times, or they go back. A press without a drag stays onEventClick, the form alternative to dragging. */
  onEventMove?: ((event: CalendarEvent, change: CalendarSlot) => void) | undefined;
}

/** A span of time on the calendar: an empty one chosen (onSlotSelect), or an event's new times (onEventMove). As
 *  a CalendarEvent's dates: a whole day (allDay) is its midnight at both ends, and days run from start's to end's. */
export interface CalendarSlot { start: Date; end: Date; allDay: boolean }

// An event as drawn: its start and end read once.
interface Shown { e: CalendarEvent; from: Date; to: Date; allDay: boolean }

const noSubscribe = () => () => {};
const yes = () => true;
const no = () => false;
const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// A start or end as a Date: a "yyyy-mm-dd" string is that local day (new Date() would make it UTC midnight).
function when(v: Date | string | undefined): Date | null {
  if (v === undefined) return null;
  if (typeof v === 'string' && DAY_ONLY.test(v)) { const [y = NaN, m = NaN, d = NaN] = v.split('-').map(Number); return new Date(y, m - 1, d); }
  const d = v instanceof Date ? v : new Date(v);
  return isValid(d) ? d : null;
}
function toShown(events: readonly CalendarEvent[]): Shown[] {
  const out: Shown[] = [];
  for (const e of events) {
    const from = when(e.start);
    if (!from) continue;
    const to = when(e.end) || from;
    out.push({ e, from, to: to < from ? from : to, allDay: !!e.allDay || (typeof e.start === 'string' && DAY_ONLY.test(e.start)) });
  }
  return out.sort(byStart);
}
// All-day first, then by start, then by title, so a day reads the same each time.
const byStart = (a: Shown, b: Shown) => Number(b.allDay) - Number(a.allDay) || a.from.getTime() - b.from.getTime() || a.e.title.localeCompare(b.e.title);
// The events on one day: those that start on it, end on it or run across it. A timed event that ends at midnight
// doesn't reach the day it ends on.
const onDay = (list: Shown[], d: Date) => list.filter((s) => compare(s.from, d) <= 0 && (compare(s.to, d) > 0
  || (compare(s.to, d) === 0 && (s.allDay || sameDay(s.from, s.to) || s.to.getHours() + s.to.getMinutes() > 0))));
// The hour of the day a time falls at (9.5 for 9:30), by the clock, so a day of a daylight saving change still runs
// 0 to 24: before the day, 0; after it, 24.
const hourOf = (t: Date, d: Date) => (sameDay(t, d) ? t.getHours() + t.getMinutes() / 60 : t < d ? 0 : 24);
/** An event placed in a day's hours: from at, for so many hours (half an hour at least, so a short one is still
 *  a target and its title shows), in lane of lanes, the side by side places a run of events that overlap share. */
interface Placed { s: Shown; at: number; len: number; lane: number; lanes: number }
function place(timed: Shown[], d: Date): Placed[] {
  const out: Placed[] = [];
  let run: Placed[] = [], ends: number[] = [], runEnd = -1;
  const close = () => { for (const p of run) p.lanes = ends.length; run = []; ends = []; };
  for (const s of timed) {
    const at = Math.min(hourOf(s.from, d), 23.5), end = Math.max(hourOf(s.to, d), at + 0.5);
    // A run ends where nothing in it reaches: each event takes the first lane free by its start.
    if (at >= runEnd) close();
    let lane = ends.findIndex((e) => e <= at);
    if (lane < 0) { lane = ends.length; ends.push(end); } else ends[lane] = end;
    const p: Placed = { s, at, len: end - at, lane, lanes: 1 };
    run.push(p); out.push(p);
    runEnd = Math.max(runEnd, end);
  }
  close();
  return out;
}
// A date moved by days and minutes on the clock, so a move across a daylight saving change keeps its time of day.
const shift = (d: Date, days: number, minutes = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes() + minutes);
const QUARTER = 15;
// Whole days from a to b, by the calendar.
const daysBetween = (a: Date, b: Date) => Math.round((day(b).getTime() - day(a).getTime()) / 864e5);
const HOURS = /* @__PURE__ */ Array.from({ length: 24 }, (_, h) => h);
// The hour the time grid opens at: 8 AM, or the first timed event's if earlier.
const OPEN_AT = 8;
const iso = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

// Gregorian with Latin digits, as Calendar: the dates and times in the grid match the day numbers.
function formatsFor(locale: string) {
  return {
    title: new Intl.DateTimeFormat(locale, { calendar: 'gregory', numberingSystem: 'latn', month: 'long', year: 'numeric' }),
    full: new Intl.DateTimeFormat(locale, { calendar: 'gregory', numberingSystem: 'latn', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    short: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    long: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
    day: new Intl.DateTimeFormat(locale, { calendar: 'gregory', numberingSystem: 'latn', weekday: 'long', month: 'long', day: 'numeric' }),
    time: numericHour(new Intl.DateTimeFormat(locale, { numberingSystem: 'latn', hour: 'numeric', minute: '2-digit' })),
    hour: numericHour(new Intl.DateTimeFormat(locale, { numberingSystem: 'latn', hour: 'numeric' })),
    range: new Intl.DateTimeFormat(locale, { calendar: 'gregory', numberingSystem: 'latn', month: 'long', day: 'numeric', year: 'numeric' }),
    zone: new Intl.DateTimeFormat(locale, { timeZoneName: 'short' }),
  };
}
type Formats = ReturnType<typeof formatsFor>;
// When an event is, in words, for the announcement after it moves: "Wednesday, March 5, 2:00 PM to 3:00 PM".
function whenOf(s: Shown, fmt: Formats, labels: typeof words): string {
  if (s.allDay) return sameDay(s.from, s.to) ? fmt.day.format(s.from) + ', ' + labels.allDay : labels.eventTime(fmt.day.format(s.from), fmt.day.format(s.to));
  if (sameDay(s.from, s.to)) return fmt.day.format(s.from) + ', ' + labels.eventTime(fmt.time.format(s.from), fmt.time.format(s.to));
  return labels.eventTime(fmt.full.format(s.from) + ' ' + fmt.time.format(s.from), fmt.full.format(s.to) + ' ' + fmt.time.format(s.to));
}

interface BodyHandlers { keyDown: (e: React.KeyboardEvent<HTMLTableElement>) => void; pointerDown: (e: React.PointerEvent<HTMLElement>) => void; setFocus: (d: Date) => void; eventClick: (e: CalendarEvent) => void }
// A slot being chosen by a drag down a day's hours: its day, and where it starts and how long it is, in hours.
interface Ghost { day: number; at: number; len: number }
interface BodyProps {
  view: EventCalendarView; month: number; focus: number; marked: number | null; ws: number; list: Shown[]; max: number; fmt: Formats; locale: string; lang: string | undefined;
  titleId: string; labels: typeof words; level: number; zone: string; now: number; movable: boolean; dragging: string | null; ghost: Ghost | null;
  grid: React.RefObject<HTMLTableElement | null>; scroller: React.RefObject<HTMLDivElement | null>; on: BodyHandlers;
}
// The month, the hours or the agenda: every day and event, each named in words. Memoized, by times rather than Dates,
// so a parent that renders again with the same props doesn't draw them all again.
const Body = /* @__PURE__ */ React.memo(function Body(p: BodyProps) {
  const { view, ws, list, max, fmt, locale, lang, titleId, labels, zone, grid, scroller, on, movable } = p;
  const month = new Date(p.month), focus = new Date(p.focus), marked = p.marked === null ? null : new Date(p.marked), now = new Date(p.now);
  const hours = view === 'week' || view === 'day';
  const H2 = ('h' + Math.min(6, p.level + 1)) as 'h3';
  // An event's time in words: "All day", "10:00 AM", or "10:00 AM to 10:30 AM" (with the dates when it spans days).
  const timeOf = (s: Shown) => {
    if (s.allDay) return labels.allDay;
    const a = fmt.time.format(s.from), b = fmt.time.format(s.to);
    if (sameDay(s.from, s.to)) return s.to.getTime() === s.from.getTime() ? a : labels.eventTime(a, b);
    return labels.eventTime(fmt.full.format(s.from) + ' ' + a, fmt.full.format(s.to) + ' ' + b);
  };
  // What the button shows (its time, then its title), then the day it's on, so a repeating or multi-day event isn't
  // several buttons of one name, then the whole time where only its start shows, and "Repeats". The name starts with
  // the visible text, so voice control finds the button by what it says.
  const shownTime = (s: Shown, detail: boolean) => (s.allDay && !detail ? '' : detail ? timeOf(s) : fmt.time.format(s.from));
  const nameOf = (s: Shown, day: Date, detail: boolean) => [[shownTime(s, detail), s.e.title].filter(Boolean).join(' '), fmt.day.format(day), detail || timeOf(s) === shownTime(s, detail) ? '' : timeOf(s), s.e.repeating ? labels.repeats : ''].filter(Boolean).join(', ');
  const eventButton = (s: Shown, day: Date, tab: 0 | -1, detail: boolean) => (
    <button type="button" tabIndex={tab} aria-label={nameOf(s, day, detail)} data-event-id={s.e.id} onClick={() => on.eventClick(s.e)}
      aria-keyshortcuts={movable && !detail ? 'Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown' : undefined}
      className={cn('dk-event-calendar__event', 'dk-event-calendar__event--' + (s.e.tone || 'primary'), s.allDay && 'dk-event-calendar__event--all-day', movable && !detail && 'dk-event-calendar__event--movable', p.dragging === s.e.id && 'dk-event-calendar__event--dragging')}>
      {s.allDay && !detail ? null : <><span className="dk-event-calendar__time">{shownTime(s, detail)}</span>{' '}</>}
      <span className="dk-event-calendar__title">{s.e.title}</span>
      {s.e.repeating ? <span className="dk-event-calendar__repeat" aria-hidden>↻</span> : null}
    </button>
  );

  const first = startOfWeek(month, ws);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i));
    if (w > 0 && row[0] && !sameMonth(row[0], month)) break;   // as many weeks as the month reaches
    weeks.push(row);
  }
  // The Tab stop: the focused day, or while a month the keys asked for isn't shown yet, today or the 1st.
  const stop = weeks.some((r) => r.some((d) => sameDay(d, focus))) ? focus : marked && sameMonth(marked, month) ? marked : month;
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
  // The week or the day shown: the focused day's.
  const span = view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focus, ws), i)) : view === 'day' ? [focus] : [];
  const allDayRows = Math.max(0, ...span.map((d) => onDay(list, d).filter((s) => s.allDay).length));
  const busy = view === 'agenda' ? days.map((d) => [d, onDay(list, d)] as const).filter(([, l]) => l.length) : [];
  return (
    view === 'month' ? (
      <table ref={grid} role="grid" lang={lang} className="dk-event-calendar__grid" aria-labelledby={titleId} onKeyDown={on.keyDown} onPointerDown={on.pointerDown}>
        <thead>
          <tr>{(weeks[0] ?? []).map((d) => <th key={d.getDay()} scope="col" abbr={fmt.long.format(d)}><span aria-hidden>{fmt.short.format(d)}</span><span className="dk-visually-hidden">{fmt.long.format(d)}</span></th>)}</tr>
        </thead>
        <tbody>
          {/* Weeks are keyed by their first day, so a day at the grid's edge keeps its cell, and focus, when its month shows. */}
          {weeks.map((row) => (
            <tr key={row[0]?.getTime()}>
              {row.map((d) => {
                const mine = sameMonth(d, month) ? onDay(list, d) : [], here = sameDay(d, stop), isToday = marked !== null && sameDay(d, marked);
                const fits = mine.length > max ? mine.slice(0, max - 1) : mine, more = mine.length - fits.length;
                return (
                  <td key={d.getTime()} role="gridcell" tabIndex={here ? 0 : -1}
                    aria-current={isToday ? 'date' : undefined} data-date={iso(d)}
                    className={cn('dk-event-calendar__day', !sameMonth(d, month) && 'dk-event-calendar__day--outside', isToday && 'dk-event-calendar__day--today')}
                    onFocus={(e) => { if (e.target === e.currentTarget && !here) on.setFocus(d); }}>
                    {/* The day's name is its text, not an aria-label, so it never hides what the cell shows (its events). */}
                    <span className="dk-visually-hidden">{fmt.full.format(d) + ', ' + labels.eventCount(mine.length, displayNumber(mine.length, locale))}</span>
                    <span className="dk-event-calendar__date" aria-hidden>{d.getDate()}</span>
                    {fits.length ? <ul className="dk-event-calendar__events" role="list">{fits.map((s) => <li key={s.e.id}>{eventButton(s, d, here ? 0 : -1, false)}</li>)}</ul> : null}
                    {more > 0 ? (
                      <Popover title={fmt.full.format(d)} placement="bottom-start" trigger={<button type="button" tabIndex={here ? 0 : -1} className="dk-event-calendar__more">{labels.moreEvents(more, displayNumber(more, locale))}</button>}>
                        <ul className="dk-event-calendar__events dk-event-calendar__events--all" role="list">{mine.map((s) => <li key={s.e.id}>{eventButton(s, d, 0, true)}</li>)}</ul>
                      </Popover>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    ) : hours ? (
      /* The days' hours: a grid of one row, a cell a day, so the keys, the names and the Tab stop are the month's.
         The weekday names and the all-day events stay pinned at the top while the hours scroll under them. The
         hour scale and the time zone are drawn beside, hidden from screen readers: each event says its time. */
      <div ref={scroller} className="dk-event-calendar__scroll" style={{ '--dk-evc-all-day': allDayRows } as React.CSSProperties} onPointerDown={on.pointerDown}>
        <table ref={grid} role="grid" lang={lang} className="dk-event-calendar__grid dk-event-calendar__hours-grid" aria-labelledby={titleId} onKeyDown={on.keyDown} data-days={span.length}>
          <thead>
            <tr>
              <td aria-hidden className="dk-event-calendar__zone">{zone}</td>
              {span.map((d) => (
                <th key={d.getTime()} scope="col" className={cn(marked && sameDay(d, marked) && 'dk-event-calendar__head--today')}>
                  <span aria-hidden>{fmt.short.format(d)} <span className="dk-event-calendar__head-date">{d.getDate()}</span></span>
                  <span className="dk-visually-hidden">{fmt.full.format(d)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td aria-hidden className="dk-event-calendar__scale">
                <div className="dk-event-calendar__pinned" />
                <div className="dk-event-calendar__hours">{HOURS.map((h) => <span key={h} data-hour={h} style={{ '--dk-evc-at': h } as React.CSSProperties}>{h ? fmt.hour.format(new Date(2000, 0, 1, h)) : ''}</span>)}</div>
              </td>
              {span.map((d) => {
                const mine = onDay(list, d), whole = mine.filter((s) => s.allDay), here = sameDay(d, focus), isToday = marked !== null && sameDay(d, marked);
                return (
                  <td key={d.getTime()} role="gridcell" tabIndex={here ? 0 : -1} aria-current={isToday ? 'date' : undefined} data-date={iso(d)}
                    className={cn('dk-event-calendar__day dk-event-calendar__column', isToday && 'dk-event-calendar__day--today')}
                    onFocus={(e) => { if (e.target === e.currentTarget && !here) on.setFocus(d); }}>
                    <span className="dk-visually-hidden">{fmt.full.format(d) + ', ' + labels.eventCount(mine.length, displayNumber(mine.length, locale))}</span>
                    <div className="dk-event-calendar__pinned">
                      {whole.length ? <ul className="dk-event-calendar__events" role="list">{whole.map((s) => <li key={s.e.id}>{eventButton(s, d, here ? 0 : -1, false)}</li>)}</ul> : null}
                    </div>
                    <div className="dk-event-calendar__hours">
                      {isToday ? <div className="dk-event-calendar__now" aria-hidden style={{ '--dk-evc-at': hourOf(now, d) } as React.CSSProperties} /> : null}
                      {p.ghost && p.ghost.day === d.getTime() ? <div className="dk-event-calendar__ghost" aria-hidden style={{ '--dk-evc-at': p.ghost.at, '--dk-evc-for': p.ghost.len } as React.CSSProperties} /> : null}
                      <ul className="dk-event-calendar__timed" role="list">
                        {place(mine.filter((s) => !s.allDay), d).map((p) => (
                          <li key={p.s.e.id} data-short={p.len < 0.75 || undefined} style={{ '--dk-evc-at': p.at, '--dk-evc-for': p.len, '--dk-evc-lane': p.lane, '--dk-evc-lanes': p.lanes } as React.CSSProperties}>
                            {eventButton(p.s, d, here ? 0 : -1, false)}
                            {/* Its end, dragged to change how long it is (Shift and the arrow keys move it; the app's form changes its length). */}
                            {movable ? <span className="dk-event-calendar__resize" data-resize={p.s.e.id} aria-hidden /> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    ) : busy.length ? (
      <ol className="dk-event-calendar__agenda" role="list" aria-labelledby={titleId} lang={lang}>
        {busy.map(([d, l]) => (
          <li key={d.getTime()} className={cn('dk-event-calendar__agenda-day', marked && sameDay(d, marked) && 'dk-event-calendar__agenda-day--today')} aria-current={marked && sameDay(d, marked) ? 'date' : undefined}>
            <H2 className="dk-event-calendar__agenda-date">{fmt.full.format(d)}</H2>
            <ul className="dk-event-calendar__events" role="list">{l.map((s) => <li key={s.e.id}>{eventButton(s, d, 0, true)}</li>)}</ul>
          </li>
        ))}
      </ol>
    ) : <p className="dk-event-calendar__empty">{labels.noEvents}</p>
  );
});

/* EventCalendar: a month of events, or the same month as an agenda. The month is an ARIA grid like Calendar's:
   one Tab stop on the days, arrows move a day or a week, Home and End to the week's ends, PageUp and PageDown a
   month; each day is named by its date and how many events it holds. Tab from a day goes to its events, buttons
   named by title, time and "Repeats"; Escape on one goes back to its day. A day with more than maxPerDay shows
   "+N more", which opens a Popover with all of them. Previous, Next and Today change the month, and the month's
   title is a polite live region, so the change is said. Below 640px the month shows as the agenda. */
/** A month of events, in a grid or as an agenda, with keyboard navigation by day.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const EventCalendar = /* @__PURE__ */ component<HTMLDivElement, EventCalendarProps>('EventCalendar', function EventCalendar(props, ref) {
  const sds = useSettings(words);
  // The hours place their events with style attributes, which a strict CSP blocks in server HTML: applied again on hydration.
  const rootRef = useServerStyles(ref);
  const rest = omit(props, { events: 1, onEventClick: 1, onSlotSelect: 1, onEventMove: 1, month: 1, defaultMonth: 1, onMonthChange: 1, view: 1, defaultView: 1, onViewChange: 1, maxPerDay: 1, locale: 1, weekStartsOn: 1, headingLevel: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const ws = props.weekStartsOn != null ? ((Math.floor(props.weekStartsOn) % 7) + 7) % 7 : firstDayOfWeek(locale);
  const today = day(new Date());
  const controlledMonth = props.month !== undefined;
  const titleId = domId('dk-evc', React.useId()) + '-title';
  // With no month given, the month is today's, and the server's today may be in another month than the visitor's
  // (a UTC server late on the 31st, a visitor in Jakarta on the 1st). Hydrating, the first render draws the month the
  // server's HTML shows (its title carries it), so nothing mismatches; then an effect moves to the visitor's (GR396).
  const fromServer = React.useRef(false);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    if (props.defaultMonth && isValid(props.defaultMonth)) return startOfMonth(props.defaultMonth);
    const shown = when(typeof document === 'undefined' ? undefined : document.getElementById(titleId)?.dataset.month);
    fromServer.current = !!shown;
    return startOfMonth(shown ?? new Date());
  });
  const month = controlledMonth && isValid(props.month) ? startOfMonth(props.month) : ownMonth;
  const showMonth = (m: Date) => { const s = startOfMonth(m); if (!controlledMonth) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  const [ownView, setOwnView] = React.useState<EventCalendarView>(isView(props.defaultView) ? props.defaultView : 'month');
  const chosen: EventCalendarView = isView(props.view) ? props.view : ownView;
  // Under the sm breakpoint, the agenda for the month and the week, whose seven columns don't fit; a day does. The
  // server draws the chosen view, as wide.
  const narrow = !useBreakpoint('sm', { serverValue: true });
  const view: EventCalendarView = narrow && chosen !== 'day' ? 'agenda' : chosen;
  const hours = view === 'week' || view === 'day';
  const setView = (v: EventCalendarView) => { if (props.view === undefined) setOwnView(v); if (props.onViewChange) props.onViewChange(v); };
  const list = React.useMemo(() => toShown(props.events), [props.events]);
  const max = Math.max(1, Math.floor(props.maxPerDay ?? 3));

  // Today is the reader's, so it's marked only once the page runs in their browser: the server's today may be
  // another day, and the server's HTML would mark it, and put the Tab stop on it, until hydration (GR210).
  const hydrated = React.useSyncExternalStore(noSubscribe, yes, no);
  // It acts once, on the first render after hydrating from a server whose month isn't the visitor's.
  // every render: no list, as it reads the month and onMonthChange of that render.
  React.useEffect(() => {
    if (!fromServer.current) return;
    fromServer.current = false;
    if (!controlledMonth && !sameMonth(ownMonth, new Date())) showMonth(new Date());
  });
  const marked = hydrated ? today : null;
  // The day with the grid's Tab stop: the one the keys or a click chose, kept inside the shown month (adjusted during
  // render, so a new month never draws without its Tab stop), else today in today's month, else the 1st.
  const [chosenDay, setFocus] = React.useState<Date | null>(() => (props.defaultMonth && isValid(props.defaultMonth) ? day(props.defaultMonth) : null));
  const focus = chosenDay ?? (marked && sameMonth(marked, month) ? marked : month);
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) { setFocusMonth(monthTime); if (chosenDay && !sameMonth(chosenDay, month)) setFocus(null); }
  const grid = React.useRef<HTMLTableElement | null>(null);
  const wantFocus = React.useRef(false);
  // A key that moves to another day asks for focus. With a controlled month, the app may show the new month a render
  // or more later (after loading its events): the request waits for the day's cell, so focus isn't left on a cell
  // that goes away (GR206).
  // every render: that day's cell is there only after the render, and maybe not until a later one.
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    const cell = grid.current.querySelector<HTMLElement>('td[data-date="' + iso(focus) + '"]');
    if (!cell) return;
    wantFocus.current = false;
    cell.focus();
  });
  const step = view === 'week' ? 7 : 1;
  // Previous and Next in the week and day views: the next week or day, and its month when it's another.
  const go = (n: Date) => { setFocus(n); if (!sameMonth(n, month)) showMonth(n); };
  const move = (d: Date) => { setFocus(d); if (!sameMonth(d, month)) showMonth(d); wantFocus.current = true; };
  // Creating and moving (onSlotSelect, onEventMove). A drag shows where it lands as it goes: the event drawn at its
  // new times (drag), or the slot being chosen (ghost). The events change only when the app updates them at its end.
  const movable = !!props.onEventMove;
  const [drag, setDrag] = React.useState<{ id: string; from: number; to: number } | null>(null);
  const [ghost, setGhost] = React.useState<Ghost | null>(null);
  const drawn = React.useMemo(() => (drag ? list.map((x) => (x.e.id === drag.id ? { ...x, from: new Date(drag.from), to: new Date(drag.to) } : x)).sort(byStart) : list), [list, drag]);
  const dragged = React.useRef(false);
  // The event moved with the keys, to focus on its new day once the app has moved it there.
  const wantEvent = React.useRef<{ id: string; day: string; events: readonly CalendarEvent[] } | null>(null);
  // every render: the moved event's button is there only once the app has given the new events.
  React.useEffect(() => {
    const w = wantEvent.current;
    if (!w || !grid.current) return;
    const cell = grid.current.querySelector<HTMLElement>('td[data-date="' + w.day + '"]');
    const b = cell && cell.querySelector<HTMLElement>('[data-event-id="' + CSS.escape(w.id) + '"]');
    // Not there with new events (it went under "+N more"): its day takes focus.
    if (b) b.focus();
    else if (props.events !== w.events && cell) cell.focus();
    else return;
    wantEvent.current = null;
  });
  const change = (x: Shown, from: Date, to: Date) => {
    if (!props.onEventMove || (from.getTime() === x.from.getTime() && to.getTime() === x.to.getTime())) return;
    props.onEventMove(x.e, { start: from, end: to, allDay: x.allDay });
    announce(sds.labels.eventChanged(x.e.title, whenOf({ ...x, from, to }, fmt, sds.labels)));
  };
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    dragged.current = false;
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;
    const t = e.target as Element, root = e.currentTarget, x0 = e.clientX, y0 = e.clientY;
    const startCell = t.closest<HTMLElement>('td[data-date]'), startDay = startCell && when(startCell.dataset.date);
    if (!startCell || !startDay) return;
    const handle = t.closest<HTMLElement>('[data-resize]'), id = handle ? handle.dataset.resize : t.closest<HTMLElement>('[data-event-id]')?.dataset.eventId;
    // An event drags with a mouse or a pen; on a touch screen a drag scrolls, and a tap opens the event.
    const x = movable && e.pointerType !== 'touch' && id ? list.find((s) => s.e.id === id) : undefined;
    if (!x && (id || t.closest('button') || !props.onSlotSelect)) return;
    const inHours = hours && !!t.closest('.dk-event-calendar__hours');
    const hourAt = (td: HTMLElement, y: number) => { const r = td.querySelector('.dk-event-calendar__hours')!.getBoundingClientRect(); return Math.min(24, Math.max(0, ((y - r.top) / r.height) * 24)); };
    const cellAt = (cx: number, cy: number) => { const td = document.elementFromPoint(cx, cy)?.closest<HTMLElement>('td[data-date]'); return td && root.contains(td) ? td : null; };
    const h0 = inHours ? hourAt(startCell, y0) : 0;
    let moved = false, last: { id: string; from: number; to: number } | null = null, chosen: Ghost | null = null;
    const onMove = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return;
      // A slot is dragged out only down the hours, with a mouse or a pen.
      if (!x && (!inHours || ev.pointerType === 'touch')) return;
      moved = true;
      if (!x) {
        const h = hourAt(startCell, ev.clientY), a = Math.floor(Math.min(h0, h) * 4) / 4, b = Math.ceil(Math.max(h0, h) * 4) / 4;
        chosen = { day: startDay.getTime(), at: a, len: Math.max(0.25, b - a) };
        setGhost(chosen);
        return;
      }
      const td = cellAt(ev.clientX, ev.clientY), at = td && when(td.dataset.date);
      if (!td || !at) return;
      const quarter = (h: number) => Math.round(h * 4) / 4;
      let from = x.from, to = x.to;
      if (handle) to = new Date(Math.max(shift(at, 0, quarter(hourAt(td, ev.clientY)) * 60).getTime(), shift(x.from, 0, QUARTER).getTime()));
      else {
        const dd = daysBetween(startDay, at), dm = inHours && !x.allDay ? Math.round((quarter(hourAt(td, ev.clientY)) - quarter(h0)) * 60) : 0;
        from = shift(x.from, dd, dm); to = shift(x.to, dd, dm);
      }
      if (last && last.from === from.getTime() && last.to === to.getTime()) return;
      last = { id: x.e.id, from: from.getTime(), to: to.getTime() };
      setDrag(last);
    };
    const end = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', end);
      window.removeEventListener('keydown', onEscape, true);
      setDrag(null); setGhost(null);
    };
    const onUp = () => {
      end();
      if (x) { if (last) { dragged.current = true; change(x, new Date(last.from), new Date(last.to)); } return; }
      const pick = props.onSlotSelect!;
      if (chosen) pick({ start: shift(startDay, 0, chosen.at * 60), end: shift(startDay, 0, (chosen.at + chosen.len) * 60), allDay: false });
      // A press without a drag: the hour from the half hour pressed, or in the month (and the all-day row) the whole day.
      else if (!moved) { const a = Math.floor(h0 * 2) * 30; pick(inHours ? { start: shift(startDay, 0, a), end: shift(startDay, 0, a + 60), allDay: false } : { start: startDay, end: startDay, allDay: true }); }
    };
    // Escape during a drag puts everything back.
    const onEscape = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(); } };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', end);
    window.addEventListener('keydown', onEscape, true);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's: leave them.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    // Escape on an event goes back to its day (not from a Popover's list, which closes on its own).
    if (e.key === 'Escape' && target.tagName === 'BUTTON' && !target.closest('[role=dialog]')) { const cell = target.closest('td'); if (cell) { e.preventDefault(); cell.focus(); } return; }
    dragged.current = false;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    // Shift and an arrow on an event move it: a day to either side, and up or down a week in the month or a quarter
    // hour in the hours (an all-day event there stays on its day). Focus follows it to its new day.
    const id = e.shiftKey && movable && !target.closest('[role=dialog]') ? target.dataset.eventId : undefined;
    const moving = id ? list.find((x) => x.e.id === id) : undefined;
    const side = e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : e.key === 'ArrowRight' ? (rtl ? -1 : 1) : 0, vert = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
    if (moving && (side || vert)) {
      e.preventDefault();
      const days = side + (hours ? 0 : vert * 7), minutes = hours && !moving.allDay ? vert * QUARTER : 0;
      if (!days && !minutes) return;
      const from = shift(moving.from, days, minutes), landing = addDays(when(target.closest('td')?.dataset.date) || day(moving.from), daysBetween(moving.from, from));
      wantEvent.current = { id: moving.e.id, day: iso(landing), events: props.events };
      go(landing);
      change(moving, from, shift(moving.to, days, minutes));
      return;
    }
    if (target.tagName !== 'TD') return;
    let n: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft': n = addDays(focus, rtl ? 1 : -1); break;
      case 'ArrowRight': n = addDays(focus, rtl ? -1 : 1); break;
      case 'ArrowUp': n = addDays(focus, -7); break;
      case 'ArrowDown': n = addDays(focus, 7); break;
      case 'Home': n = startOfWeek(focus, ws); break;
      case 'End': n = addDays(startOfWeek(focus, ws), 6); break;
      // A page is the view's: a month, or in the week and day views a week or a day.
      case 'PageUp': n = hours ? addDays(focus, -step) : addMonths(focus, -1); break;
      case 'PageDown': n = hours ? addDays(focus, step) : addMonths(focus, 1); break;
      // Enter or Space on a day chooses it whole, for a new event.
      case 'Enter': case ' ': if (!props.onSlotSelect) return; e.preventDefault(); props.onSlotSelect({ start: focus, end: focus, allDay: true }); return;
      default: return;
    }
    e.preventDefault();
    move(n);
  };

  const fmt = React.useMemo(() => formatsFor(locale), [locale]);
  // A press that started a drag isn't a click as well.
  const onEventClick = (ev: CalendarEvent) => { if (dragged.current) dragged.current = false; else if (props.onEventClick) props.onEventClick(ev); };
  // The days and events call the latest handlers through this, so Body's props stay the same while nothing it draws changes.
  const handlers = { keyDown: onKeyDown, pointerDown: onPointerDown, eventClick: onEventClick };
  const live = React.useRef(handlers); live.current = handlers;
  const on = React.useMemo<BodyHandlers>(() => ({ keyDown: (e) => live.current.keyDown(e), pointerDown: (e) => live.current.pointerDown(e), setFocus, eventClick: (e) => live.current.eventClick(e) }), []);
  const level = props.headingLevel && props.headingLevel >= 2 && props.headingLevel <= 6 ? props.headingLevel : 2;
  const H = ('h' + level) as 'h2';

  // The week or the day shown: the focused day's.
  const span = view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focus, ws), i)) : view === 'day' ? [focus] : [];
  // Spaces as plain spaces: engines put thin or ordinary ones around the dash, and the server's HTML has to match.
  const title = view === 'week' && span[0] && span[6] ? fmt.range.formatRange(span[0], span[6]).replace(/\s/g, ' ') : view === 'day' ? fmt.full.format(focus) : fmt.title.format(month);
  // The now line moves with the clock, a minute at a time, while the hours show.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    if (!hours) return;
    const t = window.setInterval(() => setNow(new Date()), minuteTick);
    return () => window.clearInterval(t);
  }, [hours]);
  // The time zone the times are in, by the reader's clock, so only once the page runs in their browser.
  const zone = hydrated ? fmt.zone.formatToParts(now).find((x) => x.type === 'timeZoneName')?.value ?? '' : '';
  const timedIn = (d: Date) => onDay(list, d).filter((s) => !s.allDay);
  const scroller = React.useRef<HTMLDivElement | null>(null);
  const spanStart = span[0] ? span[0].getTime() : 0;
  const firstHour = Math.floor(Math.min(OPEN_AT, ...span.flatMap((d) => timedIn(d).map((s) => hourOf(s.from, d)))));
  // Opened on a week or a day, the hours scroll to the first event, or 8 AM, under the pinned days and all-day row.
  useIsoLayoutEffect(() => {
    const n = scroller.current, mark = n && n.querySelector<HTMLElement>('[data-hour="' + firstHour + '"]'), pinned = n && n.querySelector<HTMLElement>('.dk-event-calendar__pinned');
    if (!n || !mark || !pinned) return;
    n.scrollTop += mark.getBoundingClientRect().top - pinned.getBoundingClientRect().bottom;
  }, [view, spanStart]);

  return (
    <div {...rest} ref={rootRef} className={cn('dk-event-calendar', props.className)} data-component="event-calendar" data-view={view} data-dragging={drag ? '' : undefined}>
      <div className="dk-event-calendar__toolbar">
        <div className="dk-event-calendar__nav">
          <Button variant="outline" size="sm" onClick={() => { showMonth(today); setFocus(today); }}>{sds.labels.goToToday}</Button>
          <IconButton icon={icons.ChevronLeft} label={view === 'week' ? sds.labels.previousWeek : view === 'day' ? sds.labels.previousDay : sds.labels.previousMonth} size="sm" variant="ghost" hideTitle className="dk-event-calendar__prev"
            onClick={() => (hours ? go(addDays(focus, -step)) : showMonth(addMonths(month, -1)))} />
          <IconButton icon={icons.ChevronRight} label={view === 'week' ? sds.labels.nextWeek : view === 'day' ? sds.labels.nextDay : sds.labels.nextMonth} size="sm" variant="ghost" hideTitle className="dk-event-calendar__next"
            onClick={() => (hours ? go(addDays(focus, step)) : showMonth(addMonths(month, 1)))} />
        </div>
        <H className="dk-event-calendar__heading" id={titleId} lang={lang} aria-live="polite" data-month={iso(month)}>{title}</H>
        {narrow ? null : <SegmentedControl size="sm" aria-label={sds.labels.calendarView} value={chosen} onValueChange={(v) => setView(isView(v) ? v : 'month')}
          options={[{ value: 'month', label: sds.labels.monthView }, { value: 'week', label: sds.labels.weekView }, { value: 'day', label: sds.labels.dayView }, { value: 'agenda', label: sds.labels.agendaView }]} />}
      </div>
      <Body view={view} month={monthTime} focus={focus.getTime()} marked={marked ? marked.getTime() : null} ws={ws} list={drawn} max={max} fmt={fmt} locale={locale} lang={lang}
        titleId={titleId} labels={sds.labels} level={level} zone={zone} now={now.getTime()} movable={movable} dragging={drag ? drag.id : null} ghost={ghost} grid={grid} scroller={scroller} on={on} />
    </div>
  );
});
