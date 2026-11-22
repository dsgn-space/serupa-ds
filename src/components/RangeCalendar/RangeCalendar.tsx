'use client';
import { dateFormat } from '../../internal/intl';
import * as React from 'react';
import { cn, domId, omit, useMergedRef } from '../../internal/cn';
import { useAutoFocus } from '../../internal/focus';
import { compare, isoDate, sameDay, toDay } from '../../internal/dates';
import { calendarOf, type CalendarSystem } from '../../internal/calendars';
import { named } from '../../internal/component';
import { FieldContext } from '../../internal/field';
import { useLocale, useSettings } from '../../internal/provider';
import { Calendar } from '../Calendar/Calendar';
import type { DateRange, DateRangeInput } from '../DateRangePicker/DateRangePicker';
import { en as rangeWords } from './labels';
import { en as pickerWords } from '../DateRangePicker/labels';
import { useControllable } from '../../internal/controllable';

const words = /* @__PURE__ */ Object.assign({}, rangeWords, pickerWords);

export interface RangeCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The picked range (controlled), or null. Use with onValueChange. Each end a Date or a plain "yyyy-mm-dd" string. */
  value?: DateRangeInput | null | undefined;
  /** The picked range at first (uncontrolled). */
  defaultValue?: DateRangeInput | null | undefined;
  /** Called once both ends are picked, with the range (local midnights, start first), and details: iso is the same range as "yyyy-mm-dd". */
  onValueChange?: ((value: { start: Date; end: Date }, details: { iso: { start: string; end: string } }) => void) | undefined;
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
  /** The calendar system the months follow, as Calendar's calendar: "persian", "islamic-umalqura", "buddhist",
      "japanese" or "roc". Values stay Dates. Default: "gregory". */
  calendar?: CalendarSystem | undefined;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
  /** A column of week numbers before the days (ISO 8601), as Calendar's weekNumbers. Default: false. */
  weekNumbers?: boolean | undefined;
  /** Each month title's heading level, 2 (default) to 6, to fit the page's outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Moves focus to the start day (or today) when the calendar appears. Default: false. */
  autoFocus?: boolean | undefined;
}

/** What DateRangePicker asks of the RangeCalendar in its popup: the start is its value the moment it's picked (so its
 *  start field shows it), and Escape closes the popup rather than dropping the start. */
export const RangePickContext = /* @__PURE__ */ React.createContext<{ onStart: (start: Date) => void } | null>(null);

const norm = (r: DateRangeInput | null | undefined): DateRange => ({ start: r ? toDay(r.start, 'RangeCalendar') : null, end: r ? toDay(r.end, 'RangeCalendar') : null });
const between = (d: Date, s: Date, e: Date) => compare(d, s) > 0 && compare(d, e) < 0;

function RangeCalendarRender({ ref, ...props }: RangeCalendarProps & React.RefAttributes<HTMLDivElement>) {
  const L = useSettings(words).labels;
  const rest = omit(props, { headingLevel: 1, weekNumbers: 1, value: 1, defaultValue: 1, onValueChange: 1, months: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, calendar: 1, weekStartsOn: 1, autoFocus: 1, className: 1 } as const);
  const root = React.useRef<HTMLDivElement | null>(null);
  const merged = useMergedRef(ref, (n: HTMLDivElement | null) => { root.current = n; });
  // autoFocus lands on the first month's day that holds the Tab stop: the start, else today.
  useAutoFocus(props.autoFocus, () => root.current && root.current.querySelector<HTMLElement>('.srp-calendar__day[tabindex="0"]'));
  const locale = useLocale(props.locale);
  const system = calendarOf(props.calendar, 'RangeCalendar');
  const [held, setOwn, controlled] = useControllable<DateRangeInput | null>(props.value, norm(props.defaultValue), 'RangeCalendar', 'value');
  const value = controlled ? norm(held) : (held as DateRange);
  const min = toDay(props.min, 'RangeCalendar') || undefined, max = toDay(props.max, 'RangeCalendar') || undefined;
  // The end picked first, while the other is still to come, and the day under the pointer or focus for the preview.
  const [anchor, setAnchor] = React.useState<Date | null>(null);
  const [hover, setHover] = React.useState<Date | null>(null);
  const home = () => { const t = new Date(); return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t; };
  const monthsId = domId('srp-range-calendar', React.useId()) + '-months';
  // With no month, defaultMonth or value, the month is today's, and the server's today may be in another month than
  // the visitor's (a UTC server late on the 31st, a visitor in Jakarta on the 1st). Hydrating, the first render draws
  // the month the server's HTML shows (data-month carries it), so nothing mismatches; then an effect moves to the
  // visitor's (GR396).
  const [first] = React.useState(() => {
    if (props.defaultMonth || value.start) return { month: system.start(props.defaultMonth || value.start!), fromServer: false };
    const shown = typeof document === 'undefined' ? null : toDay(document.getElementById(monthsId)?.dataset.month, 'RangeCalendar');
    return { month: system.start(shown || home()), fromServer: !!shown };
  });
  const [ownMonth, setOwnMonth] = React.useState(first.month);
  const movedRef = React.useRef(false);
  const base = props.month ? system.start(props.month) : ownMonth;
  const showMonth = (m: Date) => { const s = system.start(m); if (!props.month) setOwnMonth(s); if (props.onMonthChange) props.onMonthChange(s); };
  // It acts once, on the first render after hydrating from a server whose month isn't the visitor's.
  // every render: no list, as it reads the month and onMonthChange of that render.
  React.useEffect(() => {
    if (!first.fromServer || movedRef.current) return;
    movedRef.current = true;
    const h = home();
    if (!props.month && !system.same(ownMonth, h)) showMonth(h);
  });
  const two = props.months === 2;
  // In a Field, its label names the group: a <label for> can't name a group, so it's aria-labelledby, as RadioGroup's.
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const labelledBy = rest['aria-labelledby'] ?? (rest['aria-label'] ? undefined : fieldLabel);

  const inPicker = React.useContext(RangePickContext);
  // The start waiting for its end: picked here, or a value with a start and no end yet (typed in DateRangePicker).
  const open = anchor || (value.start && !value.end ? value.start : null);
  // The one rule for picking a range (DateRangePicker's too): the first pick is the start; a day before the start moves
  // the start; a day on or after it is the end.
  const pick = (d: Date) => {
    if (!open || compare(d, open) < 0) { setAnchor(d); setHover(null); if (inPicker) inPicker.onStart(d); return; }
    const r = { start: open, end: d };
    setAnchor(null);
    if (!controlled) setOwn(r);
    if (props.onValueChange) props.onValueChange(r, { iso: { start: isoDate(r.start), end: isoDate(r.end) } });
  };
  // What's shown: the start and the day under the pointer or focus after it while the end is to come, else the value.
  const shown: DateRange = open ? { start: open, end: hover && compare(hover, open) > 0 ? hover : null } : value;
  // The days' marks, made again only when the shown ends move, so each month's days (Calendar's Weeks) aren't drawn
  // again when a parent renders with the same props, or a key or the pointer moves without changing the preview.
  const from = shown.start ? shown.start.getTime() : null, to = shown.end ? shown.end.getTime() : null;
  const marks = React.useMemo(() => {
    const s = from === null ? null : new Date(from), e = to === null ? null : new Date(to);
    const inside = (d: Date) => !!s && !!e && between(d, s, e);
    return {
      isEnd: (d: Date) => sameDay(d, s) || sameDay(d, e),
      // The ends join the band between them, so each is square on the band's side (none when they're the same day).
      dayClass: (d: Date) => (inside(d) ? 'srp-calendar__day--in-range' : s && e && s < e ? (sameDay(d, s) ? 'srp-calendar__day--range-start' : sameDay(d, e) ? 'srp-calendar__day--range-end' : undefined) : undefined),
      dayLabel: (d: Date, name: string) => {
        if (sameDay(d, s)) return name + ', ' + (sameDay(d, e) ? L.startDate + ', ' + L.endDate : L.startDate);
        if (sameDay(d, e)) return name + ', ' + L.endDate;
        return inside(d) ? name + ', ' + L.inRange : name;
      },
    };
  }, [from, to, L]);
  // In the grid's calendar with Latin digits, as its days are (Calendar's formats()); thin and narrow spaces as plain ones,
  // since Node's ICU and the browser's put different spaces around the dash, so a server render would not match.
  const range = (r: DateRange) => (r.start && r.end
    ? dateFormat(locale, { dateStyle: 'medium', calendar: system.id, numberingSystem: 'latn' }).formatRange(r.start, r.end).replace(/[\u2009\u202f]/g, ' ')
    : '');
  const status = open ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;

  // With two months, a key that crosses into the month the other grid shows moves focus there, and the months stay put.
  const leave = (first: boolean) => (d: Date) => {
    if (!two || !system.same(d, first ? system.add(base, 1) : base)) return false;
    const grid = root.current && root.current.querySelectorAll('[role="grid"]')[first ? 1 : 0];
    const b = grid && grid.querySelector<HTMLElement>(`[data-date="${isoDate(d)}"]`);
    if (!b) return false;
    b.focus();
    return b.matches(':focus');
  };
  const cal = (m: Date, first: boolean) => (
    <Calendar month={m} onMonthChange={(n) => showMonth(first ? n : system.add(n, -1))} value={first ? value.start : value.end}
      min={min} max={max} isDateDisabled={props.isDateDisabled} locale={locale} calendar={system.id} weekStartsOn={props.weekStartsOn} weekNumbers={props.weekNumbers} headingLevel={props.headingLevel} hideOutside={two} pairedNav={two ? (first ? 'next' : 'previous') : undefined}
      isDateSelected={marks.isEnd} dayClassName={marks.dayClass} dayLabel={marks.dayLabel} onDayHover={setHover} onValueChange={pick} onLeaveMonth={leave(first)} />
  );
  return (
    <div {...rest} ref={merged} role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : rest['aria-label'] || L.chooseDates}
      className={cn('srp-range-calendar', two && 'srp-range-calendar--two', props.className)} data-component="range-calendar">
      {/* Escape drops a half-picked range, and goes no further (a Dialog around it stays open); in DateRangePicker the
          start is already its value, so Escape is the popup's. Leaving the days takes the preview away. */}
      <div className="srp-range-calendar__months" role="presentation" id={monthsId} data-month={isoDate(base)}
        onKeyDown={(e) => { if (e.key === 'Escape' && anchor && !inPicker) { e.preventDefault(); e.stopPropagation(); setAnchor(null); setHover(null); } }}
        onMouseLeave={() => { if (open) setHover(null); }}>
        {cal(base, true)}{two ? cal(system.add(base, 1), false) : null}
      </div>
      <p className="srp-range-calendar__status" aria-live="polite">{status}</p>
    </div>
  );
}

/* RangeCalendar: a calendar that stays on the page and picks a start and an end (a booking's dates, a report's period,
   a leave request), one or two months side by side. The first pick (a press, or Enter on a day) is the start, and the
   next on or after it the end; a day before the start moves the start. While the end is to come, the days up to the
   one under the pointer or focus are shaded as a preview. The value changes only once both are picked, and the range is then said ("Selected range: Nov 3 – 8,
   2026"). Escape drops a half-picked range. The ends are named "start date" and "end date" and the days between
   "in the range", in words as well as color. Each month is Calendar's grid, with its keys. */
/** A calendar on the page that picks a range of days: a start and an end, with one or two months side by side.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const RangeCalendar = /* @__PURE__ */ named('RangeCalendar', RangeCalendarRender);
