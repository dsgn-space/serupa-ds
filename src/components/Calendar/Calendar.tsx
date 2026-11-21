'use client';
import * as React from 'react';
import { cn, domId, omit, useLatest } from '../../internal/cn';
import { addDays, compare, day, firstDayOfWeek, isoDate, isValid, sameDay, startOfWeek, toDay } from '../../internal/dates';
import { calendarOf, type Cal, type CalendarSystem } from '../../internal/calendars';
export type { CalendarSystem } from '../../internal/calendars';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { named } from '../../internal/component';
import { useLocale, useOwnLang, useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { useFocusHandover } from '../../internal/focus';
import { dayPresets, PresetList, type PresetItem } from '../../internal/datePresets';
import { en as calendarWords } from './labels';
import { en as periodWords } from '../PeriodPicker/labels';
import { isComposing } from '../../internal/ime';
import { isRtl } from '../../internal/position';
// module state: Calendar's words and PeriodPicker's ("Previous year", "Choose a month"), for the month and year grids.
const words = /* @__PURE__ */ Object.assign({}, calendarWords, periodWords);

/** A shortcut beside the days (Calendar and DatePicker presets): its name and the day it picks, as a Date, a
    "yyyy-mm-dd" string, or a function that gives one when the list draws (so "Next Monday" follows today). */
export interface DatePreset { label: string; value: Date | string | (() => Date | string) }

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The selected day (controlled), or null. Use with onValueChange. A Date, or a plain "yyyy-mm-dd" string for that local day. */
  value?: Date | string | null | undefined;
  /** The selected day at first (uncontrolled), as a Date or "yyyy-mm-dd". */
  defaultValue?: Date | string | null | undefined;
  /** Called with the day people pick (local midnight), and details: iso is the same day as "yyyy-mm-dd". */
  onValueChange?: ((value: Date, details: { iso: string }) => void) | undefined;
  /** The month shown (controlled): any day in it. Use with onMonthChange. */
  month?: Date | undefined;
  /** The month shown at first. Default: the selected day's, or today's (min's or max's when today is outside them). */
  defaultMonth?: Date | undefined;
  /** Called when the shown month changes. */
  onMonthChange?: ((month: Date) => void) | undefined;
  /** The earliest day that can be picked, as a Date or "yyyy-mm-dd". */
  min?: Date | string | undefined;
  /** The latest day that can be picked, as a Date or "yyyy-mm-dd". */
  max?: Date | string | undefined;
  /** Days that can't be picked, such as weekends. */
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /** A BCP 47 locale for month and weekday names and the first day of the week. Default: the nearest SerupaProvider's locale, else the browser's. */
  locale?: string | undefined;
  /** The calendar system the months follow: "persian" or "islamic-umalqura" draw their own months, "buddhist",
      "japanese" and "roc" count the years their way. Values stay Dates. Default: "gregory", also for a locale
      with a -u-ca- extension. */
  calendar?: CalendarSystem | undefined;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
  /** A column of week numbers before the days (ISO 8601: the week holding the row's Thursday), for planning by week.
      Each is the row's header, so a screen reader says "Week 12" with the days. Default: false. */
  weekNumbers?: boolean | undefined;
  /** Moves focus to the selected day (or today) when the calendar appears. Default: false. */
  autoFocus?: boolean | undefined;
  /** Names for the month buttons. Default: "Previous month" and "Next month". */
  previousLabel?: string | undefined;
  /** The next month button's name. Default: "Next month". */
  nextLabel?: string | undefined;
  /** Month and year menus in the header in place of the title, to jump far (a birth date, a contract 18 months
      out) without a click per month. The years run from min's (else 100 years back) to max's (else 10 ahead).
      Default: false. */
  monthYearPicker?: boolean | undefined;
  /** Shortcuts in a list beside the days, after them in reading order: true for "Today", "Tomorrow" and "In a week",
      or your own. Picking one picks its day and shows its month. One whose day can't be picked is disabled. */
  presets?: boolean | DatePreset[] | undefined;
  /** The month title's heading level, 2 (default) to 6, to fit the page's outline where the calendar sits inline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** @internal Extra classes per day, for DateRangePicker. */
  dayClassName?: (date: Date) => string | undefined;
  /** @internal aria-selected per day, for DateRangePicker. */
  isDateSelected?: ((date: Date) => boolean) | undefined;
  /** @internal Called when a day gets focus or the pointer, for DateRangePicker's preview. */
  onDayHover?: ((date: Date) => void) | undefined;
  /** @internal Leaves the days of other months blank, for DateRangePicker's two months side by side. */
  hideOutside?: boolean | undefined;
  /** @internal A day's name from its date and the full date in words, for RangeCalendar's "start date" and "in the range". */
  dayLabel?: ((date: Date, name: string) => string) | undefined;
  /** @internal The month button a neighbouring month already shows, hidden on a wide screen, for RangeCalendar's two months. */
  pairedNav?: 'previous' | 'next' | undefined;
  /** @internal A key moving focus to a day of another month asks this first: true when a neighbouring grid shows that
   *  month and took the focus, so this one keeps its month. For RangeCalendar's two months. */
  onLeaveMonth?: ((date: Date) => boolean) | undefined;
}

// The formats a Calendar draws with, built once per locale and calendar rather than on every render (a grid of 42 days
// re-renders on each arrow key).
type Formats = { title: Intl.DateTimeFormat; short: Intl.DateTimeFormat; long: Intl.DateTimeFormat; full: Intl.DateTimeFormat; month: Intl.DateTimeFormat; monthShort: Intl.DateTimeFormat; year: Intl.DateTimeFormat };
// module state: a cache by locale and calendar.
const FORMATS = new Map<string, Formats>();
// The weekday headers' format: "short", or "narrow" where short is no shorter than the full name (Arabic, Persian:
// الأربعاء in a 32px column) or two words (Hebrew יום ד׳, Vietnamese Thứ 4), so the names don't run together (GR6).
// or long (Thai อาทิตย์, about 40px at 125% text, widens the week past a 320px screen, GR71): five or more
// characters a day on average, where Latin short names have three or four (Sun, dim.).
// Not where narrow falls back to English letters (Urdu, Pashto), which would read as another language.
function header(locale: string): Intl.DateTimeFormat {
  const fmt = (o: Intl.DateTimeFormatOptions, at = locale) => new Intl.DateTimeFormat(at, o);
  const short = fmt({ weekday: 'short' }), long = fmt({ weekday: 'long' }), narrow = fmt({ weekday: 'narrow' });
  const week = Array.from({ length: 7 }, (_, i) => new Date(2025, 2, 2 + i));
  const names = (f: Intl.DateTimeFormat) => week.map((d) => f.format(d)).join('|');
  const wide = week.some((d) => short.format(d) === long.format(d) || /\s/.test(short.format(d))) || names(short).length > 7 * 5 - 1;
  const english = names(narrow) === names(fmt({ weekday: 'narrow' }, 'en')) && names(short) !== names(fmt({ weekday: 'short' }, 'en'));
  return wide && !english ? narrow : short;
}

function formats(locale: string, cal: Cal): Formats {
  let f = FORMATS.get(locale + ' ' + cal.id);
  if (!f) {
    // The title and day labels follow the grid's calendar (Gregorian unless the calendar prop or the locale names
    // another), with Latin digits as the days have: a Thai or Persian locale alone would otherwise name another
    // month and year than the grid shows. Month and weekday names stay localized.
    const greg = { calendar: cal.id, numberingSystem: 'latn' } as const;
    f = {
      title: new Intl.DateTimeFormat(locale, { ...greg, month: 'long', year: 'numeric' }),
      short: header(locale),
      long: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { ...greg, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      month: new Intl.DateTimeFormat(locale, { ...greg, month: 'long' }),
      monthShort: new Intl.DateTimeFormat(locale, { ...greg, month: 'short' }),
      year: new Intl.DateTimeFormat(locale, { ...greg, year: 'numeric' }),
    };
    FORMATS.set(locale + ' ' + cal.id, f);
  }
  return f;
}

/** The ISO 8601 week number of a day: weeks start on Monday, and week 1 holds the year's first Thursday. */
export function isoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));   // the Thursday of its week decides the year
  return Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
}

interface DayHandlers { pick: (d: Date) => void; focus: (d: Date) => void; hover: (d: Date) => void }
interface WeeksProps {
  month: number; ws: number; stop: number; value: number | null; marked: number | null; min: number | null; max: number | null; locale: string; cal: Cal;
  isDateDisabled: CalendarProps['isDateDisabled']; isDateSelected: CalendarProps['isDateSelected']; dayLabel: CalendarProps['dayLabel']; dayClassName: CalendarProps['dayClassName'];
  hideOutside: boolean; hover: boolean; on: DayHandlers; week: string | null;
}
// The grid's weeks of days. Memoized, by times rather than Dates: a parent that renders again with the same props, or
// a RangeCalendar's other month, doesn't draw the 42 days and their names again.
const Weeks = /* @__PURE__ */ React.memo(function Weeks(p: WeeksProps) {
  const month = new Date(p.month), first = startOfWeek(month, p.ws), full = formats(p.locale, p.cal).full;
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) { const row: Date[] = []; for (let i = 0; i < 7; i++) row.push(addDays(first, w * 7 + i)); weeks.push(row); }
  const disabled = (d: Date) => (p.min !== null && d.getTime() < p.min) || (p.max !== null && d.getTime() > p.max) || (p.isDateDisabled ? p.isDateDisabled(d) : false);
  return weeks.map((row, w) => (
    <tr key={w}>
      {p.week != null ? <th scope="row" className="srp-calendar__week"><span className="srp-visually-hidden">{p.week + ' '}</span>{isoWeek(row.find((d) => d.getDay() === 4) || row[0]!)}</th> : null}
      {row.map((d) => {
        const t = d.getTime(), off = !!disabled(d), sel = p.isDateSelected ? p.isDateSelected(d) : t === p.value, outside = !p.cal.same(d, month), now = t === p.marked;
        if (outside && p.hideOutside) return <td key={t} role="gridcell" className="srp-calendar__blank" />;
        return (
          <td key={t} aria-selected={sel} role="gridcell">
            <button type="button" tabIndex={t === p.stop ? 0 : -1} aria-label={p.dayLabel ? p.dayLabel(d, full.format(d)) : full.format(d)} aria-disabled={off || undefined} aria-current={now ? 'date' : undefined}
              className={cn('srp-calendar__day', outside && 'srp-calendar__day--outside', sel && 'srp-calendar__day--selected', now && 'srp-calendar__day--today', off && 'srp-calendar__day--disabled', p.dayClassName && p.dayClassName(d))}
              data-date={d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')}
              onClick={() => p.on.pick(d)} onFocus={() => p.on.focus(d)} onMouseEnter={p.hover ? () => p.on.hover(d) : undefined}>
              {p.cal.date(d)}
            </button>
          </td>
        );
      })}
    </tr>
  ));
});

const OWN = { headingLevel: 1, weekNumbers: 1, value: 1, defaultValue: 1, onValueChange: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, calendar: 1, weekStartsOn: 1, autoFocus: 1, previousLabel: 1, nextLabel: 1, monthYearPicker: 1, presets: 1, dayClassName: 1, isDateSelected: 1, onDayHover: 1, hideOutside: 1, dayLabel: 1, pairedNav: 1, onLeaveMonth: 1, className: 1 } as const;
// For useSyncExternalStore: false in the server render and in hydration, true after it and in a browser-only render.
const never = () => () => {}, yes = () => true, no = () => false;

function CalendarRender({ ref, ...props }: CalendarProps & React.RefAttributes<HTMLDivElement>) {
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const H = ('h' + ([2, 3, 4, 5, 6].indexOf(props.headingLevel as number) < 0 ? 2 : props.headingLevel)) as 'h2';
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const cal = calendarOf(props.calendar, 'Calendar');
  const ws = Number.isFinite(props.weekStartsOn) ? ((Math.floor(props.weekStartsOn!) % 7) + 7) % 7 : firstDayOfWeek(locale);
  const controlledValue = props.value !== undefined;
  const [ownValue, setOwnValue] = React.useState<Date | null>(() => toDay(props.defaultValue, 'Calendar'));
  const value = controlledValue ? toDay(props.value, 'Calendar') : ownValue;
  const min = toDay(props.min, 'Calendar'), max = toDay(props.max, 'Calendar');
  // Today moves at midnight, also while the calendar stays open with nothing else re-rendering it.
  const [, setTick] = React.useState(0);
  const today = day(new Date());
  const todayTime = today.getTime();
  // A server's today isn't always the visitor's (a UTC server, a visitor in Jakarta before 7am), so the server render
  // and hydration mark no day as today, and put the Tab stop on the value or the month's first day: both sides
  // agree, whatever their clocks say. The visitor's today, and the Tab stop on it, follow right after hydration. A
  // render in the browser alone has them at once.
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const marked = hydrated ? today : null;
  React.useEffect(() => {
    const t = setTimeout(() => setTick((n) => n + 1), addDays(new Date(todayTime), 1).getTime() - Date.now() + 50);
    return () => clearTimeout(t);
  }, [todayTime]);
  // Where it opens with no value: today, or min or max when today is outside them, so a booking that starts next
  // year doesn't open on a month where nothing can be picked (L8E78).
  const home = min && compare(today, min) < 0 ? min : max && compare(today, max) > 0 ? max : today;
  const controlledMonth = props.month !== undefined;
  // The month has the same trouble as today when the clock picks it (no month, defaultMonth or value): on the last
  // day of a month a UTC server draws October and a visitor in Jakarta is in November, and other weeks in the grid
  // make React throw the server's calendar away. So hydration starts on the month the server drew, read from its
  // title, and the visitor's month follows right after, as their today does (GR396).
  const titleId = domId('srp-cal', React.useId()) + '-title';
  const drawn = React.useRef<number | null>(null);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    const given = props.defaultMonth || value;
    const server = given || controlledMonth ? null : serverMonth(titleId);
    if (server) drawn.current = server.getTime();
    return cal.start(given || server || home);
  });
  const homeMonth = cal.start(home).getTime();
  const onMonthChange = props.onMonthChange;
  React.useEffect(() => {
    const was = drawn.current;
    drawn.current = null;
    if (was == null || was === homeMonth || ownMonth.getTime() !== was) return;
    // The app hears of it as of any other change of month, so what it loads for the month follows (EventCalendar does the same).
    setOwnMonth(new Date(homeMonth));
    if (onMonthChange) onMonthChange(new Date(homeMonth));
  }, [homeMonth, ownMonth, onMonthChange]);   // it acts once: drawn is set only by the first render and cleared here
  const month = controlledMonth && isValid(props.month) ? cal.start(props.month) : ownMonth;
  const [focus, setFocus] = React.useState<Date>(() => (value && cal.same(value, month) ? value : cal.same(home, month) ? home : month));
  // A value set from outside (a typed date, a "Today" button) brings its month into view, unless the app controls
  // month, and takes the Tab stop: the chosen day was off screen, or another day kept the Tab stop (L8E103).
  const valueTime = value ? value.getTime() : null;
  const [seen, setSeen] = React.useState(valueTime);
  if (seen !== valueTime) {
    setSeen(valueTime);
    const away = !!value && !cal.same(value, month);
    if (value && !(away && controlledMonth)) { setFocus(value); if (away) setOwnMonth(cal.start(value)); }
  }
  const grid = React.useRef<HTMLTableElement | null>(null);
  const wantFocus = React.useRef(!!props.autoFocus);
  // The heading opens a grid of the year's months, and that grid's heading a grid of twelve years, to jump far (a
  // birth date) in a few clicks; a pick goes back down. Not with the menus (monthYearPicker), nor in RangeCalendar's
  // or DateRangePicker's two months, where each turns with the other. In the months, focus is a month counted from year 0 (y * 12 + m); in the years, a year.
  const drill = !props.monthYearPicker && !props.pairedNav && !props.hideOutside;
  const [view, setView] = React.useState<'days' | PeriodView>('days');
  const [pFocus, setPFocus] = React.useState(0);
  const periods = React.useRef<HTMLTableElement | null>(null), heading = React.useRef<HTMLButtonElement | null>(null);
  const wantPeriod = React.useRef<'grid' | 'heading' | null>(null);
  // The month that was in focus when the years opened, so coming back to a year lands on it (June 2025 to June 1990).
  const inYear = React.useRef(0);

  const disabled = (d: Date) => (min && compare(d, min) < 0) || (max && compare(d, max) > 0) || (props.isDateDisabled ? props.isDateDisabled(d) : false);
  const showMonth = (m: Date) => { const s = cal.start(m); if (!controlledMonth) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  // Keep the focused day inside the shown month when the month changes from outside or by the buttons
  // (adjusted during render, so the new month never draws without its Tab stop).
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (!cal.same(focus, month)) setFocus(value && cal.same(value, month) ? value : cal.same(home, month) ? home : month);
  }
  // every render: autoFocus or a key that moves focus asks for it, and the day's button is there only after the render.
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    const b = grid.current.querySelector<HTMLButtonElement>('button[tabindex="0"]');
    if (b) b.focus();
  });

  const move = (d: Date) => {
    if (!cal.same(d, month) && props.onLeaveMonth && props.onLeaveMonth(d)) return;
    setFocus(d); if (!cal.same(d, month)) showMonth(d); wantFocus.current = true;
  };
  const pick = (d: Date) => {
    if (disabled(d)) return;
    if (!controlledValue) setOwnValue(d);
    if (props.onValueChange) props.onValueChange(d, { iso: isoDate(d) });
    if (!cal.same(d, month)) showMonth(d);
    setFocus(d);
  };
  const minN = (v: PeriodView) => (min ? (v === 'months' ? cal.index(min) : Math.floor(cal.index(min) / 12)) : null);
  const maxN = (v: PeriodView) => (max ? (v === 'months' ? cal.index(max) : Math.floor(cal.index(max) / 12)) : null);
  const clampN = (v: PeriodView, n: number) => { const lo = minN(v), hi = maxN(v); return lo != null && n < lo ? lo : hi != null && n > hi ? hi : n; };
  const showPeriods = (v: PeriodView, n: number) => { setView(v); setPFocus(clampN(v, n)); wantPeriod.current = 'grid'; };
  const pickPeriod = (n: number) => {
    if (view === 'days') return;
    if (clampN(view, n) !== n) return;
    if (view === 'years') { showPeriods('months', n * 12 + inYear.current); return; }
    const m = cal.at(n);
    // Focus keeps its day of the month (the 17th of August to the 17th of September 1988), within the month and min..max.
    let d = cal.add(focus, n - cal.index(focus));
    if (min && compare(d, min) < 0) d = day(min);
    if (max && compare(d, max) > 0) d = day(max);
    setFocus(d); setView('days'); showMonth(m); wantFocus.current = true;
  };
  // Escape goes back a level, not out of a DatePicker's popup: the years to the months, the months to the days (and
  // focus to the heading that opened them).
  const back = () => {
    if (view === 'years') showPeriods('months', pFocus * 12 + inYear.current);
    else { setView('days'); wantPeriod.current = 'heading'; }
  };
  const onPeriodKey = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (view === 'days' || isComposing(e)) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); back(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = isRtl(e.currentTarget), rowStart = pFocus - ((pFocus - pPage) % 3);
    let n: number;
    switch (e.key) {
      case 'ArrowLeft': n = pFocus + (rtl ? 1 : -1); break;
      case 'ArrowRight': n = pFocus + (rtl ? -1 : 1); break;
      case 'ArrowUp': n = pFocus - 3; break;
      case 'ArrowDown': n = pFocus + 3; break;
      case 'Home': n = rowStart; break;
      case 'End': n = rowStart + 2; break;
      case 'PageUp': n = pFocus - 12; break;
      case 'PageDown': n = pFocus + 12; break;
      case 'Enter': case ' ': e.preventDefault(); pickPeriod(pFocus); return;
      default: return;
    }
    e.preventDefault();
    setPFocus(clampN(view, n)); wantPeriod.current = 'grid';
  };
  // every render: a view change or a key asks for focus, and what takes it is there only after the render.
  React.useEffect(() => {
    const want = wantPeriod.current;
    if (!want) return;
    wantPeriod.current = null;
    const b = want === 'heading' ? heading.current : periods.current && periods.current.querySelector<HTMLButtonElement>('button[tabindex="0"]');
    if (b) b.focus();
  });

  const onKeyDown = (e: React.KeyboardEvent) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's (Alt+← goes back a page): leave them (L8E28).
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = isRtl(e.currentTarget);
    let n: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft': n = addDays(focus, rtl ? 1 : -1); break;
      case 'ArrowRight': n = addDays(focus, rtl ? -1 : 1); break;
      case 'ArrowUp': n = addDays(focus, -7); break;
      case 'ArrowDown': n = addDays(focus, 7); break;
      case 'Home': n = startOfWeek(focus, ws); break;
      case 'End': n = addDays(startOfWeek(focus, ws), 6); break;
      case 'PageUp': n = cal.add(focus, e.shiftKey ? -12 : -1); break;
      case 'PageDown': n = cal.add(focus, e.shiftKey ? 12 : 1); break;
      case 'Enter': case ' ': e.preventDefault(); pick(focus); return;
      default: return;
    }
    e.preventDefault();
    // Keys stop at min and max, as the native date field does, so a PageDown near the end doesn't leave focus on a
    // day that can't be picked in a month the next button won't show.
    if (min && compare(n, min) < 0) n = day(min);
    if (max && compare(n, max) > 0) n = day(max);
    move(n);
  };

  const stop = hydrated ? focus : value && cal.same(value, month) ? value : month;
  const first = startOfWeek(month, ws);
  const fmts = formats(locale, cal), { short, long, month: monthName } = fmts, title = fmts.title.format(month);
  // The months' or the years' page: the year's first month (y * 12), or the first of twelve years (2016 for 2016 to 2027).
  const pPage = Math.floor(pFocus / 12) * 12;
  const periodTitle = view === 'months' ? yearText(fmts, cal, pPage / 12) : view === 'years' ? yearText(fmts, cal, pPage) + '–' + yearText(fmts, cal, pPage + 11) : '';
  // A month arrow that reaches min or max turns disabled under focus (FJ1): focus goes to the other arrow.
  const handover = useFocusHandover();
  const presets: PresetItem[] | null = props.presets === true ? dayPresets(sds.labels)
    : Array.isArray(props.presets) && props.presets.length ? props.presets.map((p) => ({ label: p.label, start: toDay(typeof p.value === 'function' ? p.value() : p.value, 'Calendar'), end: null })) : null;
  // The days read the latest handlers through this, so Weeks' props stay the same while nothing they draw changes.
  const handlers = { pick, focus: (d: Date) => { if (!sameDay(d, focus)) setFocus(d); if (props.onDayHover) props.onDayHover(d); }, hover: props.onDayHover };
  const live = useLatest(handlers);
  const on = React.useMemo<DayHandlers>(() => ({ pick: (d) => live.current.pick(d), focus: (d) => live.current.focus(d), hover: (d) => { if (live.current.hover) live.current.hover(d); } }), [live]);
  const prevNav = React.useRef<HTMLButtonElement | null>(null), nextNav = React.useRef<HTMLButtonElement | null>(null);
  return (
    <div {...rest} ref={ref} className={cn('srp-calendar', presets && 'srp-calendar--presets', props.weekNumbers && 'srp-calendar--weeks', props.pairedNav && 'srp-calendar--paired-' + props.pairedNav, props.className)} data-component="calendar">
      <div className="srp-calendar__header">
        {view === 'days' ? <IconButton icon={icons.ChevronLeft} className="srp-calendar__nav srp-calendar__nav--prev" label={props.previousLabel || sds.labels.previousMonth} size="sm" variant="ghost" hideTitle
          disabled={!!min && compare(addDays(month, -1), min) < 0} onClick={(e) => { handover(e.currentTarget, () => nextNav.current); showMonth(cal.add(month, -1)); }} ref={prevNav} />
          : <IconButton icon={icons.ChevronLeft} className="srp-calendar__nav srp-calendar__nav--prev" label={sds.labels.periodPrevious(view === 'months' ? 'month' : 'year')} size="sm" variant="ghost" hideTitle
          disabled={minN(view) != null && pPage - 1 < minN(view)!} onClick={(e) => { handover(e.currentTarget, () => nextNav.current); setPFocus(clampN(view, pFocus - 12)); }} ref={prevNav} />}
        <H className={cn('srp-calendar__title', (props.monthYearPicker || drill) && 'srp-visually-hidden')} id={titleId} data-month={isoDate(month)} lang={lang} aria-live="polite">{view === 'days' ? title : periodTitle}</H>
        {props.monthYearPicker ? <MonthYear cal={cal} fmt={fmts} month={month} min={min} max={max} today={hydrated ? today : month} names={monthName} lang={lang} monthLabel={sds.labels.month} yearLabel={sds.labels.year} onPick={showMonth} /> : null}
        {drill && view !== 'years' ? <button ref={heading} type="button" className="srp-calendar__heading" lang={lang} aria-describedby={titleId + '-hint'}
          onClick={() => (view === 'days' ? showPeriods('months', cal.index(month)) : (inYear.current = pFocus % 12, showPeriods('years', Math.floor(pFocus / 12))))}>
          {view === 'days' ? title : periodTitle}<Icon icon={icons.ExpandMore} className="srp-calendar__heading-icon" />
          <span id={titleId + '-hint'} hidden>{sds.labels.periodPlaceholder(view === 'days' ? 'month' : 'year')}</span>
        </button> : null}
        {drill && view === 'years' ? <span className="srp-calendar__heading srp-calendar__heading--static" lang={lang} aria-hidden>{periodTitle}</span> : null}
        {view === 'days' ? <IconButton icon={icons.ChevronRight} className="srp-calendar__nav srp-calendar__nav--next" label={props.nextLabel || sds.labels.nextMonth} size="sm" variant="ghost" hideTitle
          disabled={!!max && compare(cal.add(month, 1), max) > 0} onClick={(e) => { handover(e.currentTarget, () => prevNav.current); showMonth(cal.add(month, 1)); }} ref={nextNav} />
          : <IconButton icon={icons.ChevronRight} className="srp-calendar__nav srp-calendar__nav--next" label={sds.labels.periodNext(view === 'months' ? 'month' : 'year')} size="sm" variant="ghost" hideTitle
          disabled={maxN(view) != null && pPage + 12 > maxN(view)!} onClick={(e) => { handover(e.currentTarget, () => prevNav.current); setPFocus(clampN(view, pFocus + 12)); }} ref={nextNav} />}
      </div>
      {view !== 'days' ? <table ref={periods} lang={lang} role="grid" className="srp-calendar__periods" data-view={view} aria-labelledby={titleId} onKeyDown={onPeriodKey}>
        <Periods view={view} page={pPage} focus={pFocus} value={value} today={marked} min={minN(view)} max={maxN(view)} fmt={fmts} cal={cal} onPick={pickPeriod} onFocus={setPFocus} />
      </table> : null}
      <table ref={grid} lang={lang} className="srp-calendar__grid" role="grid" hidden={view !== 'days' || undefined} aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <thead>
          <tr>{props.weekNumbers ? <th scope="col" className="srp-calendar__week" abbr={sds.labels.week}><span aria-hidden>{sds.labels.weekShort}</span><span className="srp-visually-hidden">{sds.labels.week}</span></th> : null}{Array.from({ length: 7 }, (_, i) => addDays(first, i)).map((d) => <th key={d.getDay()} scope="col" abbr={long.format(d)}><span aria-hidden>{short.format(d)}</span><span className="srp-visually-hidden">{long.format(d)}</span></th>)}</tr>
        </thead>
        <tbody>
          <Weeks month={monthTime} ws={ws} stop={stop.getTime()} value={value ? value.getTime() : null} marked={marked ? marked.getTime() : null} min={min ? min.getTime() : null} max={max ? max.getTime() : null}
            locale={locale} cal={cal} isDateDisabled={props.isDateDisabled} isDateSelected={props.isDateSelected} dayLabel={props.dayLabel} dayClassName={props.dayClassName} hideOutside={!!props.hideOutside} hover={!!props.onDayHover} on={on} week={props.weekNumbers ? sds.labels.week : null} />
        </tbody>
      </table>
      {presets ? <PresetList label={sds.labels.presets} items={presets} allowed={(d) => !disabled(d)} current={{ start: value, end: null }} onPick={(it) => { if (it.start) pick(it.start); }} /> : null}
    </div>
  );
}

/* Calendar: a month of days to pick one from. Follows the ARIA date grid pattern: one Tab stop on the days,
   arrows move a day or a week, Home and End to the week's start and end, PageUp and PageDown a month (with
   Shift, a year), Enter or Space picks. Moving past the month shows the next one. Days outside min..max or
   refused by isDateDisabled are aria-disabled and can't be picked. Month and weekday names follow the locale. */
/** A month of days to pick one from, with keyboard navigation; used by DatePicker. */
export const Calendar = /* @__PURE__ */ named('Calendar', CalendarRender);

/* The month and year menus (monthYearPicker): native selects, so they work the same with keys, touch and screen
   readers. Months and years outside min..max aren't offered; a year whose month is out of range clamps to the nearest one.
   They choose what the grid shows, not a value to send, so form="" keeps them out of any form around the calendar:
   a form reset would put them back on their first options (January, the first year) while the grid stayed put (GR87). */
type PeriodView = 'months' | 'years';
// A year of the calendar in the locale's words, from a day in its middle month.
function yearText(f: Formats, cal: Cal, y: number): string { return f.year.format(cal.at(y * 12 + 6)); }
/* The months of a year, or twelve years, in rows of three: the ARIA date grid pattern, as the days and PeriodPicker are.
   One Tab stop; arrows move one or a row, Home and End to the row's ends, PageUp and PageDown a page; Enter or a
   click picks. As tall and wide as the days, so the calendar keeps its size. */
function Periods(p: { view: PeriodView; page: number; focus: number; value: Date | null; today: Date | null; min: number | null; max: number | null; fmt: Formats; cal: Cal; onPick: (n: number) => void; onFocus: (n: number) => void }) {
  const at = (d: Date | null) => (d ? (p.view === 'months' ? p.cal.index(d) : Math.floor(p.cal.index(d) / 12)) : null);
  const sel = at(p.value), now = at(p.today);
  const rows: number[][] = [];
  for (let r = 0; r < 4; r++) rows.push([0, 1, 2].map((i) => p.page + r * 3 + i));
  return (
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((n) => {
              const off = (p.min != null && n < p.min) || (p.max != null && n > p.max);
              return (
                <td key={n} role="gridcell" aria-selected={n === sel}>
                  <button type="button" tabIndex={n === p.focus ? 0 : -1} aria-disabled={off || undefined} aria-current={n === now ? 'date' : undefined}
                    className={cn('srp-calendar__period', n === sel && 'srp-calendar__period--selected', n === now && 'srp-calendar__period--today', off && 'srp-calendar__period--disabled')}
                    onClick={() => p.onPick(n)} onFocus={() => { if (n !== p.focus) p.onFocus(n); }}>
                    {p.view === 'months' ? <><span aria-hidden>{p.fmt.monthShort.format(p.cal.at(n))}</span><span className="srp-visually-hidden">{p.fmt.title.format(p.cal.at(n))}</span></> : yearText(p.fmt, p.cal, n)}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
  );
}

// The month a server drew, from the title's data-month, while its markup waits for hydration. Null in a render with
// no server markup: the title isn't in the page yet.
function serverMonth(titleId: string): Date | null {
  const at = typeof document === 'undefined' ? null : document.getElementById(titleId);
  return at ? toDay(at.getAttribute('data-month')) : null;
}

function MonthYear(p: { cal: Cal; fmt: Formats; month: Date; min: Date | null; max: Date | null; today: Date; names: Intl.DateTimeFormat; lang: string | undefined; monthLabel: string; yearLabel: string; onPick: (m: Date) => void }) {
  // Months counted as year * 12 + month in the calendar's own years, so the menus follow a Persian or Hijri year too.
  const cal = p.cal, n = cal.index(p.month), y = Math.floor(n / 12), m = n - y * 12, now = Math.floor(cal.index(p.today) / 12);
  const lo = p.min ? cal.index(p.min) : null, hi = p.max ? cal.index(p.max) : null;
  const from = lo != null ? Math.floor(lo / 12) : Math.min(y, now - 100);
  const to = hi != null ? Math.floor(hi / 12) : Math.max(y, now + 10);
  const out = (k: number) => (lo != null && k < lo) || (hi != null && k > hi);
  // A year whose month is out of range clamps to the nearest month in it.
  const go = (k: number) => p.onPick(cal.at(lo != null && k < lo ? lo : hi != null && k > hi ? hi : k));
  const years: number[] = [];
  for (let i = from; i <= to; i++) years.push(i);
  return (
    <span className="srp-calendar__menus">
      <select className="srp-calendar__menu" form="" aria-label={p.monthLabel} lang={p.lang} value={m} onChange={(e) => go(y * 12 + +e.currentTarget.value)}>
        {Array.from({ length: 12 }, (_, i) => <option key={i} value={i} disabled={out(y * 12 + i)}>{p.names.format(cal.at(y * 12 + i))}</option>)}
      </select>
      <select className="srp-calendar__menu" form="" aria-label={p.yearLabel} lang={cal.id === 'gregory' ? undefined : p.lang} value={y} onChange={(e) => go(+e.currentTarget.value * 12 + m)}>
        {years.map((yy) => <option key={yy} value={yy}>{cal.id === 'gregory' ? yy : yearText(p.fmt, cal, yy)}</option>)}
      </select>
    </span>
  );
}
