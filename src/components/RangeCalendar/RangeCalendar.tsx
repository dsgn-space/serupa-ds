'use client';
import * as React from 'react';
import { cn, domId, omit, useMergedRef } from '../../internal/cn';
import { useAutoFocus } from '../../internal/focus';
import { addMonths, compare, isoDate, sameDay, sameMonth, startOfMonth, toDay } from '../../internal/dates';
import { component } from '../../internal/component';
import { FieldContext } from '../../internal/field';
import { useLocale, useSettings } from '../../internal/provider';
import { Calendar } from '../Calendar/Calendar';
import type { DateRange, DateRangeInput } from '../DateRangePicker/DateRangePicker';
import { en as rangeWords } from './labels';
import { en as pickerWords } from '../DateRangePicker/labels';

const words = /* @__PURE__ */ Object.assign({}, rangeWords, pickerWords);

export interface RangeCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The picked range (controlled), or null. Use with onValueChange. Each end a Date or a plain "yyyy-mm-dd" string. */
  value?: DateRangeInput | null | undefined;
  /** The picked range at first (uncontrolled). */
  defaultValue?: DateRangeInput | null | undefined;
  /** Called once both ends are picked, with the range (local midnights, start first) and the same as "yyyy-mm-dd". */
  onValueChange?: ((value: { start: Date; end: Date }, iso: { start: string; end: string }) => void) | undefined;
  /** Months side by side: 1 (default) or 2. Two stack on a narrow screen. */
  months?: 1 | 2 | undefined;
  /** The month shown first (controlled): any day in it. Use with onMonthChange. */
  month?: Date | undefined;
  /** The month shown first at the start. Default: the range's start's, else today's (min's or max's when today is outside them). */
  defaultMonth?: Date | undefined;
  /** Called when the first month shown changes. */
  onMonthChange?: ((month: Date) => void) | undefined;
  /** The earliest day that can be an end, as a Date or "yyyy-mm-dd". */
  min?: Date | string | undefined;
  /** The latest day that can be an end, as a Date or "yyyy-mm-dd". */
  max?: Date | string | undefined;
  /** Days that can't be an end, such as days already booked. They're struck through, and can sit inside a range. */
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /** A BCP 47 locale for the names and the first day of the week. Default: the nearest SerupaProvider's locale, else the browser's. */
  locale?: string | undefined;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
  /** Moves focus to the start day (or today) when the calendar appears. Default: false. */
  autoFocus?: boolean | undefined;
}

const norm = (r: DateRangeInput | null | undefined): DateRange => ({ start: r ? toDay(r.start, 'RangeCalendar') : null, end: r ? toDay(r.end, 'RangeCalendar') : null });
const order = (a: Date, b: Date) => (compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a });
const between = (d: Date, s: Date, e: Date) => compare(d, s) > 0 && compare(d, e) < 0;

/* RangeCalendar: a calendar that stays on the page and picks a start and an end (a booking's dates, a report's period,
   a leave request), one or two months side by side. The first pick (a press, or Enter on a day) is one end, the second
   the other, in either order; while one end is picked, the days up to the one under the pointer or focus are shaded
   as a preview. The value changes only once both are picked, and the range is then said ("Selected range: Nov 3 – 8,
   2026"). Escape drops a half-picked range. The ends are named "start date" and "end date" and the days between
   "in the range", in words as well as color. Each month is Calendar's grid, with its keys. */
/** A calendar on the page that picks a range of days: a start and an end, with one or two months side by side.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const RangeCalendar = /* @__PURE__ */ component<HTMLDivElement, RangeCalendarProps>('RangeCalendar', function RangeCalendar(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { value: 1, defaultValue: 1, onValueChange: 1, months: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, weekStartsOn: 1, autoFocus: 1, className: 1 } as const);
  const root = React.useRef<HTMLDivElement | null>(null);
  const merged = useMergedRef(ref, (n: HTMLDivElement | null) => { root.current = n; });
  // autoFocus lands on the first month's day that holds the Tab stop: the start, else today.
  useAutoFocus(props.autoFocus, () => root.current && root.current.querySelector<HTMLElement>('.dk-calendar__day[tabindex="0"]'));
  const locale = useLocale(props.locale);
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<DateRange>(() => norm(props.defaultValue));
  const value = controlled ? norm(props.value) : own;
  const min = toDay(props.min, 'RangeCalendar') || undefined, max = toDay(props.max, 'RangeCalendar') || undefined;
  // The end picked first, while the other is still to come, and the day under the pointer or focus for the preview.
  const [anchor, setAnchor] = React.useState<Date | null>(null);
  const [hover, setHover] = React.useState<Date | null>(null);
  const home = () => { const t = new Date(); return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t; };
  const monthsId = domId('dk-range-calendar', React.useId()) + '-months';
  // With no month, defaultMonth or value, the month is today's, and the server's today may be in another month than
  // the visitor's (a UTC server late on the 31st, a visitor in Jakarta on the 1st). Hydrating, the first render draws
  // the month the server's HTML shows (data-month carries it), so nothing mismatches; then an effect moves to the
  // visitor's (GR396).
  const fromServer = React.useRef(false);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    if (props.defaultMonth || value.start) return startOfMonth(props.defaultMonth || value.start!);
    const shown = typeof document === 'undefined' ? null : toDay(document.getElementById(monthsId)?.dataset.month, 'RangeCalendar');
    fromServer.current = !!shown;
    return startOfMonth(shown || home());
  });
  const base = props.month ? startOfMonth(props.month) : ownMonth;
  const showMonth = (m: Date) => { const s = startOfMonth(m); if (!props.month) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  // It acts once, on the first render after hydrating from a server whose month isn't the visitor's.
  // every render: no list, as it reads the month and onMonthChange of that render.
  React.useEffect(() => {
    if (!fromServer.current) return;
    fromServer.current = false;
    const h = home();
    if (!props.month && !sameMonth(ownMonth, h)) showMonth(h);
  });
  const two = props.months === 2;
  // In a Field, its label names the group: a <label for> can't name a group, so it's aria-labelledby, as RadioGroup's.
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const labelledBy = rest['aria-labelledby'] ?? (rest['aria-label'] ? undefined : fieldLabel);

  const pick = (d: Date) => {
    if (!anchor) { setAnchor(d); setHover(d); return; }
    const r = order(anchor, d);
    setAnchor(null);
    if (!controlled) setOwn(r);
    if (props.onValueChange) props.onValueChange(r, { start: isoDate(r.start), end: isoDate(r.end) });
  };
  // What's shown: the preview while one end is picked, else the value.
  const shown: DateRange = anchor ? order(anchor, hover || anchor) : value;
  const isEnd = (d: Date) => sameDay(d, shown.start) || sameDay(d, shown.end);
  const inside = (d: Date) => !!shown.start && !!shown.end && between(d, shown.start, shown.end);
  const dayClass = (d: Date) => (inside(d) ? 'dk-calendar__day--in-range' : undefined);
  const dayLabel = (d: Date, name: string) => {
    if (sameDay(d, shown.start)) return name + ', ' + (sameDay(d, shown.end) ? L.startDate + ', ' + L.endDate : L.startDate);
    if (sameDay(d, shown.end)) return name + ', ' + L.endDate;
    return inside(d) ? name + ', ' + L.inRange : name;
  };
  // Gregorian with Latin digits, as the grid's days are (Calendar's formats()); thin and narrow spaces as plain ones,
  // since Node's ICU and the browser's put different spaces around the dash, so a server render would not match.
  const range = (r: DateRange) => (r.start && r.end
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: 'gregory', numberingSystem: 'latn' }).formatRange(r.start, r.end).replace(/[\u2009\u202f]/g, ' ')
    : '');
  const status = anchor ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;

  const cal = (m: Date, first: boolean) => (
    <Calendar month={m} onMonthChange={(n) => showMonth(first ? n : addMonths(n, -1))} value={first ? value.start : value.end}
      min={min} max={max} isDateDisabled={props.isDateDisabled} locale={locale} weekStartsOn={props.weekStartsOn} hideOutside={two} pairedNav={two ? (first ? 'next' : 'previous') : undefined}
      isDateSelected={isEnd} dayClassName={dayClass} dayLabel={dayLabel} onDayHover={setHover} onValueChange={pick} />
  );
  return (
    <div {...rest} ref={merged} role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : rest['aria-label'] || L.chooseDates}
      className={cn('dk-range-calendar', two && 'dk-range-calendar--two', props.className)} data-component="range-calendar">
      {/* Escape drops a half-picked range, and goes no further (a Dialog around it stays open); leaving the days puts
          the preview back on the end picked. */}
      <div className="dk-range-calendar__months" role="presentation" id={monthsId} data-month={isoDate(base)}
        onKeyDown={(e) => { if (e.key === 'Escape' && anchor) { e.preventDefault(); e.stopPropagation(); setAnchor(null); setHover(null); } }}
        onMouseLeave={() => { if (anchor) setHover(anchor); }}>
        {cal(base, true)}{two ? cal(addMonths(base, 1), false) : null}
      </div>
      <p className="dk-range-calendar__status" aria-live="polite">{status}</p>
    </div>
  );
});
