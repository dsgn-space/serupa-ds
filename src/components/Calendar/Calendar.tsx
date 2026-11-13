'use client';
import * as React from 'react';
import { cn, domId, omit } from '../../internal/cn';
import { addDays, addMonths, compare, day, firstDayOfWeek, isoDate, isValid, sameDay, sameMonth, startOfMonth, startOfWeek, toDay } from '../../internal/dates';
import { IconButton } from '../IconButton/IconButton';
import { component } from '../../internal/component';
import { useLocale, useOwnLang, useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { useFocusHandover } from '../../internal/focus';
import { dayPresets, PresetList, type PresetItem } from '../../internal/datePresets';
import { en as words } from './labels';

/** A shortcut beside the days (Calendar and DatePicker presets): its name and the day it picks, as a Date, a
    "yyyy-mm-dd" string, or a function that gives one when the list draws (so "Next Monday" follows today). */
export interface DatePreset { label: string; value: Date | string | (() => Date | string) }

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The selected day (controlled), or null. Use with onValueChange. A Date, or a plain "yyyy-mm-dd" string for that local day. */
  value?: Date | string | null | undefined;
  /** The selected day at first (uncontrolled), as a Date or "yyyy-mm-dd". */
  defaultValue?: Date | string | null | undefined;
  /** Called with the day people pick (local midnight), and the same day as "yyyy-mm-dd". */
  onValueChange?: ((value: Date, iso: string) => void) | undefined;
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
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
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
  /** @internal Extra classes per day, for DateRangePicker. */
  dayClassName?: (date: Date) => string | undefined;
  /** @internal aria-selected per day, for DateRangePicker. */
  isDateSelected?: ((date: Date) => boolean) | undefined;
  /** @internal Called when a day gets focus or the pointer, for DateRangePicker's preview. */
  onDayHover?: ((date: Date) => void) | undefined;
  /** @internal Leaves the days of other months blank, for DateRangePicker's two months side by side. */
  hideOutside?: boolean | undefined;
}

// The four formats a Calendar draws with, built once per locale rather than on every render (a grid of 42 days
// re-renders on each arrow key).
type Formats = { title: Intl.DateTimeFormat; short: Intl.DateTimeFormat; long: Intl.DateTimeFormat; full: Intl.DateTimeFormat; month: Intl.DateTimeFormat };
// module state: a cache by locale.
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

function formats(locale: string): Formats {
  let f = FORMATS.get(locale);
  if (!f) {
    // The grid is Gregorian with Latin digits, so the title and day labels are too (a Thai or Persian title would
    // otherwise name another month and year). Month and weekday names stay localized.
    const greg = { calendar: 'gregory', numberingSystem: 'latn' } as const;
    f = {
      title: new Intl.DateTimeFormat(locale, { ...greg, month: 'long', year: 'numeric' }),
      short: header(locale),
      long: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      full: new Intl.DateTimeFormat(locale, { ...greg, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      month: new Intl.DateTimeFormat(locale, { ...greg, month: 'long' }),
    };
    FORMATS.set(locale, f);
  }
  return f;
}

const OWN = { value: 1, defaultValue: 1, onValueChange: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, weekStartsOn: 1, autoFocus: 1, previousLabel: 1, nextLabel: 1, monthYearPicker: 1, presets: 1, dayClassName: 1, isDateSelected: 1, onDayHover: 1, hideOutside: 1, className: 1 } as const;
// For useSyncExternalStore: false in the server render and in hydration, true after it and in a browser-only render.
const never = () => () => {}, yes = () => true, no = () => false;

/* Calendar: a month of days to pick one from. Follows the ARIA date grid pattern: one Tab stop on the days,
   arrows move a day or a week, Home and End to the week's start and end, PageUp and PageDown a month (with
   Shift, a year), Enter or Space picks. Moving past the month shows the next one. Days outside min..max or
   refused by isDateDisabled are aria-disabled and can't be picked. Month and weekday names follow the locale. */
/** A month of days to pick one from, with keyboard navigation; used by DatePicker. */
export const Calendar = /* @__PURE__ */ component<HTMLDivElement, CalendarProps>('Calendar', function Calendar(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const ws = props.weekStartsOn != null ? ((Math.floor(props.weekStartsOn) % 7) + 7) % 7 : firstDayOfWeek(locale);
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
  const titleId = domId('dk-cal', React.useId()) + '-title';
  const drawn = React.useRef<number | null>(null);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    const given = props.defaultMonth || value;
    const server = given ? null : serverMonth(titleId);
    if (server) drawn.current = server.getTime();
    return startOfMonth(given || server || home);
  });
  const homeMonth = startOfMonth(home).getTime();
  React.useEffect(() => {
    const was = drawn.current;
    drawn.current = null;
    if (was != null && was !== homeMonth) setOwnMonth((m) => (m.getTime() === was ? new Date(homeMonth) : m));
  }, [homeMonth]);
  const month = controlledMonth && isValid(props.month) ? startOfMonth(props.month) : ownMonth;
  const [focus, setFocus] = React.useState<Date>(() => (value && sameMonth(value, month) ? value : sameMonth(home, month) ? home : month));
  // A value set from outside (a typed date, a "Today" button) brings its month into view, unless the app controls
  // month, and takes the Tab stop: the chosen day was off screen, or another day kept the Tab stop (L8E103).
  const valueTime = value ? value.getTime() : null;
  const [seen, setSeen] = React.useState(valueTime);
  if (seen !== valueTime) {
    setSeen(valueTime);
    const away = !!value && !sameMonth(value, month);
    if (value && !(away && controlledMonth)) { setFocus(value); if (away) setOwnMonth(startOfMonth(value)); }
  }
  const grid = React.useRef<HTMLTableElement | null>(null);
  const wantFocus = React.useRef(!!props.autoFocus);

  const disabled = (d: Date) => (min && compare(d, min) < 0) || (max && compare(d, max) > 0) || (props.isDateDisabled ? props.isDateDisabled(d) : false);
  const showMonth = (m: Date) => { const s = startOfMonth(m); if (!controlledMonth) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  // Keep the focused day inside the shown month when the month changes from outside or by the buttons
  // (adjusted during render, so the new month never draws without its Tab stop).
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (!sameMonth(focus, month)) setFocus(value && sameMonth(value, month) ? value : sameMonth(home, month) ? home : month);
  }
  // every render: autoFocus or a key that moves focus asks for it, and the day's button is there only after the render.
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    const b = grid.current.querySelector<HTMLButtonElement>('button[tabindex="0"]');
    if (b) b.focus();
  });

  const move = (d: Date) => { setFocus(d); if (!sameMonth(d, month)) showMonth(d); wantFocus.current = true; };
  const pick = (d: Date) => {
    if (disabled(d)) return;
    if (!controlledValue) setOwnValue(d);
    if (props.onValueChange) props.onValueChange(d, isoDate(d));
    if (!sameMonth(d, month)) showMonth(d);
    setFocus(d);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's (Alt+← goes back a page): leave them (L8E28).
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    let n: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft': n = addDays(focus, rtl ? 1 : -1); break;
      case 'ArrowRight': n = addDays(focus, rtl ? -1 : 1); break;
      case 'ArrowUp': n = addDays(focus, -7); break;
      case 'ArrowDown': n = addDays(focus, 7); break;
      case 'Home': n = startOfWeek(focus, ws); break;
      case 'End': n = addDays(startOfWeek(focus, ws), 6); break;
      case 'PageUp': n = addMonths(focus, e.shiftKey ? -12 : -1); break;
      case 'PageDown': n = addMonths(focus, e.shiftKey ? 12 : 1); break;
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

  const stop = hydrated ? focus : value && sameMonth(value, month) ? value : month;
  const first = startOfWeek(month, ws);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) { const row: Date[] = []; for (let i = 0; i < 7; i++) row.push(addDays(first, w * 7 + i)); weeks.push(row); }
  const { short, long, full, month: monthName } = formats(locale);
  const title = formats(locale).title.format(month);
  const selected = (d: Date) => (props.isDateSelected ? props.isDateSelected(d) : sameDay(d, value));
  // A month arrow that reaches min or max turns disabled under focus (FJ1): focus goes to the other arrow.
  const handover = useFocusHandover();
  const presets: PresetItem[] | null = props.presets === true ? dayPresets(sds.labels)
    : Array.isArray(props.presets) && props.presets.length ? props.presets.map((p) => ({ label: p.label, start: toDay(typeof p.value === 'function' ? p.value() : p.value, 'Calendar'), end: null })) : null;
  const prevNav = React.useRef<HTMLButtonElement | null>(null), nextNav = React.useRef<HTMLButtonElement | null>(null);
  return (
    <div {...rest} ref={ref} className={cn('dk-calendar', presets && 'dk-calendar--presets', props.className)} data-component="calendar">
      <div className="dk-calendar__header">
        <IconButton icon={icons.ChevronLeft} className="dk-calendar__nav dk-calendar__nav--prev" label={props.previousLabel || sds.labels.previousMonth} size="sm" variant="ghost" hideTitle
          disabled={!!min && compare(addDays(month, -1), min) < 0} onClick={(e) => { handover(e.currentTarget, () => nextNav.current); showMonth(addMonths(month, -1)); }} ref={prevNav} />
        <h2 className={cn('dk-calendar__title', props.monthYearPicker && 'dk-visually-hidden')} id={titleId} data-month={isoDate(month).slice(0, 7)} lang={lang} aria-live="polite">{title}</h2>
        {props.monthYearPicker ? <MonthYear month={month} min={min} max={max} today={hydrated ? today : month} names={monthName} lang={lang} monthLabel={sds.labels.month} yearLabel={sds.labels.year} onPick={showMonth} /> : null}
        <IconButton icon={icons.ChevronRight} className="dk-calendar__nav dk-calendar__nav--next" label={props.nextLabel || sds.labels.nextMonth} size="sm" variant="ghost" hideTitle
          disabled={!!max && compare(addMonths(month, 1), max) > 0} onClick={(e) => { handover(e.currentTarget, () => prevNav.current); showMonth(addMonths(month, 1)); }} ref={nextNav} />
      </div>
      <table ref={grid} lang={lang} className="dk-calendar__grid" role="grid" aria-labelledby={titleId} onKeyDown={onKeyDown}>
        <thead>
          <tr>{(weeks[0] ?? []).map((d) => <th key={d.getDay()} scope="col" abbr={long.format(d)}><span aria-hidden>{short.format(d)}</span><span className="dk-visually-hidden">{long.format(d)}</span></th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((row, w) => (
            <tr key={w}>
              {row.map((d) => {
                const off = !!disabled(d), sel = selected(d), outside = !sameMonth(d, month), now = !!marked && sameDay(d, marked);
                if (outside && props.hideOutside) return <td key={d.getTime()} role="gridcell" className="dk-calendar__blank" />;
                return (
                  <td key={d.getTime()} aria-selected={sel} role="gridcell">
                    <button type="button" tabIndex={sameDay(d, stop) ? 0 : -1} aria-label={full.format(d)} aria-disabled={off || undefined} aria-current={now ? 'date' : undefined}
                      className={cn('dk-calendar__day', outside && 'dk-calendar__day--outside', sel && 'dk-calendar__day--selected', now && 'dk-calendar__day--today', off && 'dk-calendar__day--disabled', props.dayClassName && props.dayClassName(d))}
                      data-date={d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')}
                      onClick={() => pick(d)} onFocus={() => { if (!sameDay(d, focus)) setFocus(d); if (props.onDayHover) props.onDayHover(d); }}
                      onMouseEnter={props.onDayHover ? () => props.onDayHover!(d) : undefined}>
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {presets ? <PresetList label={sds.labels.presets} items={presets} allowed={(d) => !disabled(d)} current={{ start: value, end: null }} onPick={(it) => { if (it.start) pick(it.start); }} /> : null}
    </div>
  );
});

/* The month and year menus (monthYearPicker): native selects, so they work the same with keys, touch and screen
   readers. Months and years outside min..max aren't offered; a year whose month is out of range clamps to the nearest one.
   They choose what the grid shows, not a value to send, so form="" keeps them out of any form around the calendar:
   a form reset would put them back on their first options (January, the first year) while the grid stayed put (GR87). */
// The month a server drew, from the title's data-month, while its markup waits for hydration. Null in a render with
// no server markup: the title isn't in the page yet.
function serverMonth(titleId: string): Date | null {
  const at = typeof document === 'undefined' ? null : document.getElementById(titleId);
  const m = at ? /^(\d{4})-(\d{2})$/.exec(at.getAttribute('data-month') || '') : null;
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, 1) : null;
}

function MonthYear(p: { month: Date; min: Date | null; max: Date | null; today: Date; names: Intl.DateTimeFormat; lang: string | undefined; monthLabel: string; yearLabel: string; onPick: (m: Date) => void }) {
  const y = p.month.getFullYear();
  const from = p.min ? p.min.getFullYear() : Math.min(y, p.today.getFullYear() - 100);
  const to = p.max ? p.max.getFullYear() : Math.max(y, p.today.getFullYear() + 10);
  const out = (yy: number, m: number) => (!!p.min && new Date(yy, m + 1, 0) < p.min) || (!!p.max && new Date(yy, m, 1) > p.max);
  const go = (yy: number, m: number) => {
    let d = new Date(yy, m, 1);
    if (p.min && d < startOfMonth(p.min)) d = startOfMonth(p.min);
    if (p.max && d > p.max) d = startOfMonth(p.max);
    p.onPick(d);
  };
  const years: number[] = [];
  for (let i = from; i <= to; i++) years.push(i);
  return (
    <span className="dk-calendar__menus">
      <select className="dk-calendar__menu" form="" aria-label={p.monthLabel} lang={p.lang} value={p.month.getMonth()} onChange={(e) => go(y, +e.currentTarget.value)}>
        {Array.from({ length: 12 }, (_, m) => <option key={m} value={m} disabled={out(y, m)}>{p.names.format(new Date(2000, m, 1))}</option>)}
      </select>
      <select className="dk-calendar__menu" form="" aria-label={p.yearLabel} value={y} onChange={(e) => go(+e.currentTarget.value, p.month.getMonth())}>
        {years.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
      </select>
    </span>
  );
}
