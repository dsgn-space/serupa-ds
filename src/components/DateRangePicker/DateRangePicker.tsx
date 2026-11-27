'use client';
import * as React from 'react';
import { useControlSize } from '../../internal/controlSize';
import { useMergedRef, cn, domId, isInvalid, oneOf, SIZES } from '../../internal/cn';
import { compare, datePattern, formatDate, isoDate, parseDate, toDay } from '../../internal/dates';
import { calendarOf, type CalendarSystem } from '../../internal/calendars';
import { reject } from '../../internal/rejectInput';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useExit } from '../../internal/useExit';
import { RangeCalendar, RangePickContext } from '../RangeCalendar/RangeCalendar';
import { InputAction } from '../Input/Input';
import { named } from '../../internal/component';
import { useFieldControl } from '../../internal/field';
import { useLocale, useSettings } from '../../internal/provider';
import { useFormReset } from '../../internal/useFormReset';
import * as icons from '../../material/builtin';
import { isComposing } from '../../internal/ime';
import { delegateFocus, useAutoFocus, windowBlur } from '../../internal/focus';
import { en as DateRangePickerWords } from './labels';
import { en as DatePickerWords } from '../DatePicker/labels';
import { en as CalendarWords } from '../Calendar/labels';
import { en as RangeCalendarWords } from '../RangeCalendar/labels';
import { PresetList, rangePresets, type PresetItem } from '../../internal/datePresets';
import { useControllable } from '../../internal/controllable';
import { useOpenState, type OpenChangeDetails, type OpenChangeReason } from '../../internal/openChange';
// This component's words and the ones it shares with DatePicker, Calendar (the presets' "Today" and their name) and
// RangeCalendar ("Selected range").
const words = /* @__PURE__ */ Object.assign({}, DateRangePickerWords, DatePickerWords, /* @__PURE__ */ Object.assign({}, CalendarWords, RangeCalendarWords));

/** A range of days; either end can be empty while it's being chosen. */
export interface DateRange { start: Date | null; end: Date | null }
/** A range as given to DateRangePicker: each end a Date, a plain "yyyy-mm-dd" string for that local day, or null. */
export interface DateRangeInput { start: Date | string | null; end: Date | string | null }

/** A shortcut beside the months (DateRangePicker presets): its name and the range it picks, each end a Date or
    "yyyy-mm-dd", or a function that gives one when the list draws (so "This quarter" follows today). */
export interface DateRangePreset { label: string; value: DateRangeInput | (() => DateRangeInput) }

export interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'defaultValue' | 'onChange'> {
  /** The chosen range (controlled). Use with onValueChange. Each end a Date or a plain "yyyy-mm-dd" string. */
  value?: DateRangeInput | undefined;
  /** The chosen range at first (uncontrolled). */
  defaultValue?: DateRangeInput | undefined;
  /** Called with the new range whenever either end changes (local midnights), and details (iso: the same range as "yyyy-mm-dd" strings). */
  onValueChange?: ((value: DateRange, details: { iso: { start: string | null; end: string | null } }) => void) | undefined;
  /** Called when typed text is put back on blur or Enter: "unreadable" when it isn't a date, "unavailable" when it
      is one that can't be chosen (outside min..max, or isDateDisabled). The field also says so to screen readers. */
  onInvalidInput?: ((text: string, reason: 'unreadable' | 'unavailable') => void) | undefined;
  /** The earliest and latest days that can be chosen, as Dates or "yyyy-mm-dd". */
  min?: Date | string | undefined;
  /** The latest day that can be chosen, as a Date or "yyyy-mm-dd". */
  max?: Date | string | undefined;
  /** Days that can't be the start or end, such as holidays. They can sit inside a range. */
  isDateDisabled?: ((date: Date) => boolean) | undefined;
  /** A BCP 47 locale for the typed format, names and first day of the week. Default: the nearest SerupaProvider's locale, else the browser's. */
  locale?: string | undefined;
  /** The calendar system the popup's months follow, as Calendar's calendar: "persian", "islamic-umalqura",
      "buddhist", "japanese" or "roc". The typed date stays Gregorian, so it reads back as the same day. Default:
      "gregory". */
  calendar?: CalendarSystem | undefined;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
  /** A column of week numbers before the days (ISO 8601), as Calendar's weekNumbers. Default: false. */
  weekNumbers?: boolean | undefined;
  /** 'sm', 'md' (default) or 'lg', like Input. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Marks both fields invalid (aria-invalid and the error border), as on Input. */
  invalid?: boolean | undefined;
  /** Turns both fields and the calendar button off, as a disabled native control. */
  disabled?: boolean | undefined;
  /** Shows the dates without letting them change, as a read-only <input>. */
  readOnly?: boolean | undefined;
  /** Both fields are required: a form won't submit until each end has a date, as with a required <input>. */
  required?: boolean | undefined;
  /** The start field's id, so a Field or <label htmlFor> focuses it. */
  id?: string | undefined;
  /** Names for the two fields. Default: "Start date" and "End date". */
  startLabel?: string | undefined;
  /** The end field's name. Default: "End date". */
  endLabel?: string | undefined;
  /** Form names: hidden inputs send each end as yyyy-mm-dd. */
  startName?: string | undefined;
  /** The form name the end date is sent under, as yyyy-mm-dd. */
  endName?: string | undefined;
  /** The id of a form to submit and reset with, when it isn't inside one, as the form attribute of an input. */
  form?: string | undefined;
  /** The calendar button's name. Default: "Choose dates". */
  buttonLabel?: string | undefined;
  /** Months shown side by side in the popup: 1 or 2 (default). */
  months?: 1 | 2 | undefined;
  /** Shortcuts beside the months in the popup: true for "Today", "Yesterday", "Last 7 days", "Last 30 days", "This
      month" and "Last month", or your own. Picking one sets the range and shows it in the months; the popup stays open
      so it can be checked, and closes as usual. One whose start or end can't be chosen is disabled. */
  presets?: boolean | DateRangePreset[] | undefined;
  /** Whether the calendar popup shows (controlled). Use with onOpenChange. Opened this way, focus stays where it is. */
  open?: boolean | undefined;
  /** Shows the calendar popup at first (uncontrolled), without moving focus into it. Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called when the popup asks to open or close, with why: { reason: 'trigger' | 'escape' | 'outside' | 'blur' | 'select' | 'api' }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}

const norm = (r: DateRangeInput | undefined): DateRange => ({ start: r ? toDay(r.start, 'DateRangePicker') : null, end: r ? toDay(r.end, 'DateRangePicker') : null });
const key = (d: Date | null) => (d ? d.getTime() : null);

function DateRangePickerRender({ ref, ...props }: DateRangePickerProps & React.RefAttributes<HTMLSpanElement>) {
  props = useFieldControl(props);   // the props a surrounding Field hands it, at any depth
  const sds = useSettings(words);
  const { value: _v, defaultValue: _d, onValueChange, open: _o, defaultOpen: _do, onOpenChange, onInvalidInput, min: minIn, max: maxIn, isDateDisabled, locale: localeProp, calendar, weekStartsOn, weekNumbers, size: _s, invalid: _i, disabled, readOnly, required: requiredProp, id, startLabel, endLabel, startName, endName, form, buttonLabel, months: _m, presets: presetsProp, autoFocus, className, ...rest } = props;
  const locale = useLocale(localeProp);
  const system = calendarOf(calendar, 'DateRangePicker');
  const size = oneOf(SIZES, useControlSize(props.size), 'md');
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  const describedBy = rest['aria-describedby'], required = rest['aria-required'] ?? (requiredProp || undefined);
  const errorMessage = rest['aria-errormessage'];
  delete rest['aria-describedby']; delete rest['aria-required']; delete rest['aria-errormessage'];
  const [held, setOwn, controlled] = useControllable<DateRangeInput>(props.value, norm(props.defaultValue), 'DateRangePicker', 'value');
  const value = controlled ? norm(held) : (held as DateRange);
  const min = toDay(minIn, 'DateRangePicker') || undefined, max = toDay(maxIn, 'DateRangePicker') || undefined;
  const fmt = (d: Date | null) => (d ? formatDate(d, locale) : '');
  const [text, setText] = React.useState({ start: fmt(value.start), end: fmt(value.end) });
  // The range and locale the text was last written for (a new locale, the browser's after hydration, rewrites it too):
  // state, so a render can compare without reading a ref.
  // Primitives, so writing the same one again draws nothing (a redraw would put the text back over what's typed).
  const [seenStart, setSeenStart] = React.useState(key(value.start));
  const [seenEnd, setSeenEnd] = React.useState(key(value.end));
  const [seenLocale, setSeenLocale] = React.useState(locale);
  if (key(value.start) !== seenStart || key(value.end) !== seenEnd || locale !== seenLocale) {
    setSeenStart(key(value.start)); setSeenEnd(key(value.end)); setSeenLocale(locale);
    const t = { start: fmt(value.start), end: fmt(value.end) };
    if (t.start !== text.start || t.end !== text.end) setText(t);
  }
  const [open, setOpen] = useOpenState(props.open, props.defaultOpen, onOpenChange, 'DateRangePicker', !!disabled || !!readOnly);
  // Focus goes into the months when the person opens them (the button, Alt+ArrowDown), not when they show on arrival
  // (defaultOpen) or because the app set open.
  const [focusIn, setFocusIn] = React.useState(false);
  // With no start, today, or min or max when today is outside them, so the popup doesn't open on a month where
  // nothing can be picked (L8E79).
  const home = () => { const t = new Date(); return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t; };
  const [base, setBase] = React.useState(() => system.start(value.start || home()));
  const popId = domId('srp-drp', React.useId());
  const [rejected, setRejected] = React.useState('');   // what was said about typed text put back, shown under the fields
  const box = React.useRef<HTMLSpanElement | null>(null);
  const startField = React.useRef<HTMLInputElement | null>(null);
  // ref.current.focus() and autoFocus land on the start field, as they would on a date input.
  const start = () => startField.current;
  useAutoFocus(autoFocus, start);
  useFormReset(startField, () => {
    if (controlled) return;
    const r = norm(props.defaultValue);
    setSeenStart(key(r.start)); setSeenEnd(key(r.end)); setOwn(r); setText({ start: fmt(r.start), end: fmt(r.end) }); setOpen(false, 'api');
  });
  const button = React.useRef<HTMLButtonElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const two = props.months !== 1;

  const allowed = (d: Date) => !(min && compare(d, min) < 0) && !(max && compare(d, max) > 0) && !(isDateDisabled && isDateDisabled(d));
  const commit = (r: DateRange) => {
    setSeenStart(key(r.start)); setSeenEnd(key(r.end));
    setText({ start: fmt(r.start), end: fmt(r.end) });
    if (key(r.start) === key(value.start) && key(r.end) === key(value.end)) return;
    if (!controlled) setOwn(r);
    if (onValueChange) onValueChange(r, { iso: { start: r.start ? isoDate(r.start) : null, end: r.end ? isoDate(r.end) : null } });
  };
  const read = (which: 'start' | 'end') => {
    const raw = text[which].trim();
    let d: Date | null = raw === '' ? null : parseDate(raw, locale);
    if (raw !== '' && !(d && allowed(d))) { reject(raw, d ? 'unavailable' : 'unreadable', onInvalidInput, sds.labels.inputNotAccepted, setRejected); d = value[which]; }
    const r = { ...value, [which]: d };
    // A start past the end clears the end; an end before the start is turned down out loud, as a date outside min and
    // max is, so the text doesn't just vanish.
    if (r.start && r.end && compare(r.start, r.end) > 0) {
      if (which === 'start') r.end = null;
      else { reject(raw, 'unavailable', onInvalidInput, sds.labels.inputNotAccepted, setRejected); r.end = value.end; }
    }
    commit(r);
  };
  const close = (focus: boolean, reason: OpenChangeReason) => { setOpen(false, reason); setFocusIn(false); if (focus && startField.current) startField.current.focus(); };
  const show = () => {
    const typed = parseDate(text.start, locale);
    setBase(system.start((typed && allowed(typed) ? typed : null) || value.start || home()));
    setFocusIn(true);
    setOpen(true, 'trigger');
  };
  // The calendar stays (inert) while the popup fades out (DZ1).
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, box, { placement: 'bottom-start', offsetVar: '--srp-drp-offset', onOutside: () => close(false, 'outside'), onFocusOutside: () => close(false, 'blur'), inside: button });

  const off = !!disabled || !!readOnly;
  const presets: PresetItem[] | null = presetsProp === true ? rangePresets(sds.labels, max)
    : Array.isArray(presetsProp) && presetsProp.length ? presetsProp.map((p) => { const r = norm(typeof p.value === 'function' ? p.value() : p.value); return { label: p.label, ...r }; }) : null;
  // A preset sets both ends and brings its start's month into view; the popup stays open to show it (RU11).
  const choose = (it: PresetItem) => { commit({ start: it.start, end: it.end }); if (it.start) setBase(system.start(it.start)); };
  const field = (which: 'start' | 'end') => (
    <input type="text" inputMode="numeric" autoComplete="off" className="srp-input__field srp-date-range-picker__field"
      ref={which === 'start' ? startField : undefined} id={which === 'start' ? id : undefined}
      aria-label={which === 'start' ? startLabel || sds.labels.startDate : endLabel || sds.labels.endDate} aria-describedby={cn(describedBy, popId + '-format', rejected && popId + '-rejected')} aria-errormessage={invalid ? errorMessage : undefined} aria-required={required} aria-invalid={invalid || undefined}
      value={text[which]} placeholder={datePattern(locale)} disabled={disabled} readOnly={readOnly} required={requiredProp} form={form}
      onChange={(e) => { setText({ ...text, [which]: e.target.value }); setRejected(''); }} onBlur={(e) => { if (!windowBlur(e)) read(which); }}
      onKeyDown={(e) => {
        if (isComposing(e)) return;
        if (e.key === 'Enter') read(which);
        else if (e.key === 'ArrowDown' && e.altKey && !off) { e.preventDefault(); read(which); show(); }
      }} />
  );
  // The months are RangeCalendar's, so the two pick a range the same way and name its days the same way; the start is
  // the value as soon as it's picked, and the end closes the popup.
  const starts = { onStart: (d: Date) => { commit({ start: d, end: null }); } };
  const months = (
    <RangePickContext.Provider value={starts}>
      <RangeCalendar className="srp-date-range-picker__calendar" aria-label={buttonLabel || sds.labels.chooseDates} value={value} months={two ? 2 : 1} month={base} onMonthChange={setBase}
        min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} calendar={system.id} weekStartsOn={weekStartsOn} weekNumbers={weekNumbers} autoFocus={focusIn}
        onValueChange={(r) => { commit(r); close(true, 'select'); }} />
    </RangePickContext.Provider>
  );
  const mergedRef = useMergedRef(ref, (n) => { box.current = n; delegateFocus(n, start); });
  return (
    <>
    <span {...rest} ref={mergedRef} role="group"
      className={cn('srp-input', 'srp-input--size-' + size, 'srp-date-range-picker', invalid && 'srp-input--invalid', disabled && 'srp-input--disabled', readOnly && 'srp-input--readonly', className)} data-invalid={invalid ? '' : undefined} data-disabled={disabled ? '' : undefined} data-readonly={readOnly ? '' : undefined}
      data-component="date-range-picker" data-state={open ? 'open' : 'closed'} data-size={size}>
      {field('start')}
      <span className="srp-date-range-picker__dash" aria-hidden>–</span>
      <span id={popId + '-format'} hidden>{sds.labels.formatHint(datePattern(locale))}</span>
      {field('end')}
      <span className="srp-input__actions srp-date-range-picker__actions">
        <InputAction ref={button} className="srp-date-picker__button srp-date-range-picker__button" icon={icons.DateRange} label={buttonLabel || sds.labels.chooseDates} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popId : undefined}
          disabled={off} onClick={() => { if (open) close(false, 'trigger'); else { read('start'); show(); } }} />
      </span>
      {startName ? <input type="hidden" name={startName} form={form} value={value.start ? isoDate(value.start) : ''} disabled={disabled} /> : null}
      {endName ? <input type="hidden" name={endName} form={form} value={value.end ? isoDate(value.end) : ''} disabled={disabled} /> : null}
      <div ref={panel} id={popId} role="dialog" aria-label={buttonLabel || sds.labels.chooseDates} {...{ popover: 'manual' }} hidden={!open || undefined} inert={!open || undefined} data-instant={exit.instant ? '' : undefined} className="srp-date-picker__popup srp-date-range-picker__popup"
        onKeyDown={(e) => { if (e.key === 'Escape' && !isComposing(e)) { e.preventDefault(); e.stopPropagation(); close(true, 'escape'); } }}>
        {open || exit.leaving ? <>
          {presets ? <div className="srp-date-range-picker__body">
            {months}
            <PresetList label={sds.labels.presets} items={presets} allowed={allowed} current={value} onPick={choose} />
          </div> : months}
        </> : null}
      </div>
    </span>
      {/* Why typed text was put back (GR232): until the text changes; said out loud already, and read with the field. */}
      {rejected && <span id={popId + '-rejected'} className="srp-input-rejected">{rejected}</span>}
    </>
  );
}

/* DateRangePicker: two date fields (start – end) in one box with a calendar button, for a stay, a report period
   or a filter. People type either end in the locale's order (or yyyy-mm-dd), or pick both in a popup with two
   months side by side (RangeCalendar's, so the rule is the same): the first pick is the start, the next the end (a
   day before the start moves the start instead), and the days between preview under the pointer. Typed text is read on blur and Enter; text that
   can't be used puts back the last good day, and a start after the end clears the end. The popup opens on the
   button or Alt+ArrowDown, and closes when the range is complete, on Escape, a click outside or focus moving past it. */
/** Two date fields for a start and end, with a two-month calendar popup to pick the range. */
export const DateRangePicker = /* @__PURE__ */ named('DateRangePicker', DateRangePickerRender);
