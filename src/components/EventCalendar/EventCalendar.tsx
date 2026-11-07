"use client";
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn";
import { component } from "../../internal/component";
import { addDays, addMonths, compare, day, firstDayOfWeek, isValid, sameDay, sameMonth, startOfMonth, startOfWeek } from "../../internal/dates";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider";
import * as icons from "../../material/builtin";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Popover } from "../Popover/Popover";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { en as CalendarWords } from "../Calendar/labels";
import { en as EventCalendarWords } from "./labels";
// Its own words and the month buttons' names it shares with Calendar.
const words = /* @__PURE__ */ Object.assign({}, EventCalendarWords, CalendarWords);

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
  tone?: "primary" | "info" | "success" | "warning" | "danger" | undefined;
}

/** EventCalendar's two views. */
export type EventCalendarView = "month" | "agenda";

export interface EventCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue"> {
  /** The events to show. Those in the shown month are drawn. */
  events: readonly CalendarEvent[];
  /** Called when an event is clicked, or pressed with Enter or Space, with the event: open its details from here. */
  onEventClick?: ((event: CalendarEvent) => void) | undefined;
  /** The month shown (controlled): any day in it. Use with onMonthChange. */
  month?: Date | undefined;
  /** The month shown at first. Default: today's. */
  defaultMonth?: Date | undefined;
  /** Called with the month's first day when Previous, Next, Today or the keyboard changes it. */
  onMonthChange?: ((month: Date) => void) | undefined;
  /** 'month' (a grid of weeks) or 'agenda' (a list of the days with events), controlled. Use with onViewChange. */
  view?: EventCalendarView | undefined;
  /** The view at first. Default: 'month'. Below 640px wide the month shows as the agenda, which fits a phone. */
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
}

// An event as drawn: its start and end read once.
interface Shown { e: CalendarEvent; from: Date; to: Date; allDay: boolean }

const NARROW = "(max-width: 639.98px)";
const noSubscribe = () => () => {};
const subscribeNarrow = (on: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener("change", on); return () => m.removeEventListener("change", on); };
const isNarrow = () => window.matchMedia(NARROW).matches;
const notNarrow = () => false;
const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// A start or end as a Date: a "yyyy-mm-dd" string is that local day (new Date() would make it UTC midnight).
function when(v: Date | string | undefined): Date | null {
  if (v === undefined) return null;
  if (typeof v === "string" && DAY_ONLY.test(v)) { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); }
  const d = v instanceof Date ? v : new Date(v);
  return isValid(d) ? d : null;
}
function toShown(events: readonly CalendarEvent[]): Shown[] {
  const out: Shown[] = [];
  for (const e of events) {
    const from = when(e.start);
    if (!from) continue;
    const to = when(e.end) || from;
    out.push({ e, from, to: to < from ? from : to, allDay: !!e.allDay || (typeof e.start === "string" && DAY_ONLY.test(e.start)) });
  }
  // All-day first, then by start, then by title, so a day reads the same each time.
  return out.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.from.getTime() - b.from.getTime() || a.e.title.localeCompare(b.e.title));
}
// The events on one day: those that start on it, end on it or run across it. A timed event that ends at midnight
// doesn't reach the day it ends on.
const onDay = (list: Shown[], d: Date) => list.filter((s) => compare(s.from, d) <= 0 && (compare(s.to, d) > 0
  || (compare(s.to, d) === 0 && (s.allDay || sameDay(s.from, s.to) || s.to.getHours() + s.to.getMinutes() > 0))));
const iso = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

/* EventCalendar: a month of events, or the same month as an agenda. The month is an ARIA grid like Calendar's:
   one Tab stop on the days, arrows move a day or a week, Home and End to the week's ends, PageUp and PageDown a
   month; each day is named by its date and how many events it holds. Tab from a day goes to its events, buttons
   named by title, time and "Repeats"; Escape on one goes back to its day. A day with more than maxPerDay shows
   "+N more", which opens a Popover with all of them. Previous, Next and Today change the month, and the month's
   title is a polite live region, so the change is said. Below 640px the month shows as the agenda. */
/** A month of events, in a grid or as an agenda, with keyboard navigation by day.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const EventCalendar = /* @__PURE__ */ component<HTMLDivElement, EventCalendarProps>("EventCalendar", function EventCalendar(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, { events: 1, onEventClick: 1, month: 1, defaultMonth: 1, onMonthChange: 1, view: 1, defaultView: 1, onViewChange: 1, maxPerDay: 1, locale: 1, weekStartsOn: 1, headingLevel: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const ws = props.weekStartsOn != null ? ((Math.floor(props.weekStartsOn) % 7) + 7) % 7 : firstDayOfWeek(locale);
  const today = day(new Date());
  const controlledMonth = props.month !== undefined;
  const [ownMonth, setOwnMonth] = React.useState(() => startOfMonth(props.defaultMonth && isValid(props.defaultMonth) ? props.defaultMonth : new Date()));
  const month = controlledMonth && isValid(props.month) ? startOfMonth(props.month) : ownMonth;
  const showMonth = (m: Date) => { const s = startOfMonth(m); if (!controlledMonth) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  const [ownView, setOwnView] = React.useState<EventCalendarView>(props.defaultView === "agenda" ? "agenda" : "month");
  const chosen: EventCalendarView = props.view === "agenda" || props.view === "month" ? props.view : ownView;
  const narrow = React.useSyncExternalStore(typeof window === "undefined" ? noSubscribe : subscribeNarrow, typeof window === "undefined" ? notNarrow : isNarrow, notNarrow);
  const view = narrow ? "agenda" : chosen;
  const setView = (v: EventCalendarView) => { if (props.view === undefined) setOwnView(v); if (props.onViewChange) props.onViewChange(v); };
  const list = React.useMemo(() => toShown(props.events), [props.events]);
  const max = Math.max(1, Math.floor(props.maxPerDay ?? 3));

  // The day with the grid's Tab stop: today in today's month, else the 1st, kept inside the shown month (adjusted
  // during render, so a new month never draws without its Tab stop).
  const [focus, setFocus] = React.useState<Date>(() => (sameMonth(today, month) ? today : month));
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) { setFocusMonth(monthTime); if (!sameMonth(focus, month)) setFocus(sameMonth(today, month) ? today : month); }
  const grid = React.useRef<HTMLTableElement | null>(null);
  const wantFocus = React.useRef(false);
  // every render: a key that moves to another day asks for focus, and that day's cell is there only after the render.
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    grid.current.querySelector<HTMLElement>('td[tabindex="0"]')?.focus();
  });
  const move = (d: Date) => { setFocus(d); if (!sameMonth(d, month)) showMonth(d); wantFocus.current = true; };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's: leave them.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    // Escape on an event goes back to its day (not from a Popover's list, which closes on its own).
    if (e.key === "Escape" && target.tagName === "BUTTON" && !target.closest("[role=dialog]")) { const cell = target.closest("td"); if (cell) { e.preventDefault(); cell.focus(); } return; }
    if (target.tagName !== "TD") return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let n: Date | null = null;
    switch (e.key) {
      case "ArrowLeft": n = addDays(focus, rtl ? 1 : -1); break;
      case "ArrowRight": n = addDays(focus, rtl ? -1 : 1); break;
      case "ArrowUp": n = addDays(focus, -7); break;
      case "ArrowDown": n = addDays(focus, 7); break;
      case "Home": n = startOfWeek(focus, ws); break;
      case "End": n = addDays(startOfWeek(focus, ws), 6); break;
      case "PageUp": n = addMonths(focus, -1); break;
      case "PageDown": n = addMonths(focus, 1); break;
      default: return;
    }
    e.preventDefault();
    move(n);
  };

  const fmt = React.useMemo(() => ({
    title: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", month: "long", year: "numeric" }),
    full: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long" }),
    day: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", month: "long", day: "numeric" }),
    time: new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }),
  }), [locale]);
  const titleId = domId("dk-evc", React.useId()) + "-title";
  const level = props.headingLevel && props.headingLevel >= 2 && props.headingLevel <= 6 ? props.headingLevel : 2;
  const H = ("h" + level) as "h2", H2 = ("h" + Math.min(6, level + 1)) as "h3";

  // An event's time in words: "All day", "10:00 AM", or "10:00 AM to 10:30 AM" (with the dates when it spans days).
  const timeOf = (s: Shown) => {
    if (s.allDay) return sds.labels.allDay;
    const a = fmt.time.format(s.from), b = fmt.time.format(s.to);
    if (sameDay(s.from, s.to)) return s.to.getTime() === s.from.getTime() ? a : sds.labels.eventTime(a, b);
    return sds.labels.eventTime(fmt.full.format(s.from) + " " + a, fmt.full.format(s.to) + " " + b);
  };
  // The day it shows on is in the name, so a repeating or multi-day event isn't several buttons of one name.
  const nameOf = (s: Shown, day: Date) => [s.e.title, fmt.day.format(day), timeOf(s), s.e.repeating ? sds.labels.repeats : ""].filter(Boolean).join(", ");
  const eventButton = (s: Shown, day: Date, tab: 0 | -1, detail: boolean) => (
    <button type="button" tabIndex={tab} aria-label={nameOf(s, day)} data-event-id={s.e.id} onClick={() => props.onEventClick?.(s.e)}
      className={cn("dk-event-calendar__event", "dk-event-calendar__event--" + (s.e.tone || "primary"), s.allDay && "dk-event-calendar__event--all-day")}>
      {s.allDay && !detail ? null : <span className="dk-event-calendar__time">{detail ? timeOf(s) : fmt.time.format(s.from)}</span>}
      <span className="dk-event-calendar__title">{s.e.title}</span>
      {s.e.repeating ? <span className="dk-event-calendar__repeat" aria-hidden>↻</span> : null}
    </button>
  );

  const first = startOfWeek(month, ws);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i));
    if (w > 0 && !sameMonth(row[0], month)) break;   // as many weeks as the month reaches
    weeks.push(row);
  }
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
  const busy = view === "agenda" ? days.map((d) => [d, onDay(list, d)] as const).filter(([, l]) => l.length) : [];

  return (
    <div {...rest} ref={ref} className={cn("dk-event-calendar", props.className)} data-component="event-calendar" data-view={view}>
      <div className="dk-event-calendar__toolbar">
        <div className="dk-event-calendar__nav">
          <Button variant="outline" size="sm" onClick={() => { showMonth(today); setFocus(today); }}>{sds.labels.goToToday}</Button>
          <IconButton icon={icons.ChevronLeft} label={sds.labels.previousMonth} size="sm" variant="ghost" hideTitle className="dk-event-calendar__prev" onClick={() => showMonth(addMonths(month, -1))} />
          <IconButton icon={icons.ChevronRight} label={sds.labels.nextMonth} size="sm" variant="ghost" hideTitle className="dk-event-calendar__next" onClick={() => showMonth(addMonths(month, 1))} />
        </div>
        <H className="dk-event-calendar__heading" id={titleId} lang={lang} aria-live="polite">{fmt.title.format(month)}</H>
        {narrow ? null : <SegmentedControl size="sm" aria-label={sds.labels.calendarView} value={chosen} onValueChange={(v) => setView(v === "agenda" ? "agenda" : "month")}
          options={[{ value: "month", label: sds.labels.monthView }, { value: "agenda", label: sds.labels.agendaView }]} />}
      </div>
      {view === "month" ? (
        <table ref={grid} role="grid" lang={lang} className="dk-event-calendar__grid" aria-labelledby={titleId} onKeyDown={onKeyDown}>
          <thead>
            <tr>{weeks[0].map((d) => <th key={d.getDay()} scope="col" abbr={fmt.long.format(d)}><span aria-hidden>{fmt.short.format(d)}</span><span className="dk-visually-hidden">{fmt.long.format(d)}</span></th>)}</tr>
          </thead>
          <tbody>
            {weeks.map((row, w) => (
              <tr key={w}>
                {row.map((d) => {
                  const mine = onDay(list, d), here = sameDay(d, focus), isToday = sameDay(d, today);
                  const fits = mine.length > max ? mine.slice(0, max - 1) : mine, more = mine.length - fits.length;
                  return (
                    <td key={d.getTime()} role="gridcell" tabIndex={here ? 0 : -1} aria-label={fmt.full.format(d) + ", " + sds.labels.eventCount(mine.length)}
                      aria-current={isToday ? "date" : undefined} data-date={iso(d)}
                      className={cn("dk-event-calendar__day", !sameMonth(d, month) && "dk-event-calendar__day--outside", isToday && "dk-event-calendar__day--today")}
                      onFocus={(e) => { if (e.target === e.currentTarget && !here) setFocus(d); }}>
                      <span className="dk-event-calendar__date" aria-hidden>{d.getDate()}</span>
                      {fits.length ? <ul className="dk-event-calendar__events" role="list">{fits.map((s) => <li key={s.e.id}>{eventButton(s, d, here ? 0 : -1, false)}</li>)}</ul> : null}
                      {more > 0 ? (
                        <Popover title={fmt.full.format(d)} placement="bottom-start" trigger={<button type="button" tabIndex={here ? 0 : -1} className="dk-event-calendar__more">{sds.labels.moreEvents(more)}</button>}>
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
      ) : busy.length ? (
        <ol className="dk-event-calendar__agenda" aria-labelledby={titleId} lang={lang}>
          {busy.map(([d, l]) => (
            <li key={d.getTime()} className={cn("dk-event-calendar__agenda-day", sameDay(d, today) && "dk-event-calendar__agenda-day--today")} aria-current={sameDay(d, today) ? "date" : undefined}>
              <H2 className="dk-event-calendar__agenda-date">{fmt.full.format(d)}</H2>
              <ul className="dk-event-calendar__events" role="list">{l.map((s) => <li key={s.e.id}>{eventButton(s, d, 0, true)}</li>)}</ul>
            </li>
          ))}
        </ol>
      ) : <p className="dk-event-calendar__empty">{sds.labels.noEvents}</p>}
    </div>
  );
});
