'use client';
import * as React from 'react';
import { useMergedRef, cn, domId, isInvalid, oneOf, SIZES } from '../../internal/cn';
import { addMonths, compare, datePattern, formatDate, isoDate, parseDate, sameDay, startOfMonth, toDay } from '../../internal/dates';
import { reject } from '../../internal/rejectInput';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useExit } from '../../internal/useExit';
import { Calendar } from '../Calendar/Calendar';
import { Icon } from '../Icon/Icon';
import { component } from '../../internal/component';
import { useFieldControl } from '../../internal/field';
import { useLocale, useSettings } from '../../internal/provider';
import { useFormReset } from '../../internal/useFormReset';
import * as icons from '../../material/builtin';
import { isComposing } from '../../internal/ime';
import { delegateFocus, useAutoFocus, windowBlur } from '../../internal/focus';
import { en as DateRangePickerWords } from './labels';
import { en as DatePickerWords } from '../DatePicker/labels';
import { en as CalendarWords } from '../Calendar/labels';
import { PresetList, rangePresets, type PresetItem } from '../../internal/datePresets';
// This component's words and the ones it shares with DatePicker and Calendar (the presets' "Today" and their name).
const words = /* @__PURE__ */ Object.assign({}, DateRangePickerWords, DatePickerWords, CalendarWords);

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
  /** Called with the new range whenever either end changes (local midnights), and the same range as "yyyy-mm-dd" strings. */
  onValueChange?: ((value: DateRange, iso: { start: string | null; end: string | null }) => void) | undefined;
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
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number | undefined;
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
}

const norm = (r: DateRangeInput | undefined): DateRange => ({ start: r ? toDay(r.start, 'DateRangePicker') : null, end: r ? toDay(r.end, 'DateRangePicker') : null });
const key = (d: Date | null) => (d ? d.getTime() : null);

/* DateRangePicker: two date fields (start – end) in one box with a calendar button, for a stay, a report period
   or a filter. People type either end in the locale's order (or yyyy-mm-dd), or pick both in a popup with two
   months side by side: the first pick is the start, the second the end (a day before the start moves the start
   instead), and the days between preview under the pointer. Typed text is read on blur and Enter; text that
   can't be used puts back the last good day, and a start after the end clears the end. The popup opens on the
   button or Alt+ArrowDown, and closes when the range is complete, on Escape, a click outside or focus moving past it. */
/** Two date fields for a start and end, with a two-month calendar popup to pick the range. */
export const DateRangePicker = /* @__PURE__ */ component<HTMLSpanElement, DateRangePickerProps>('DateRangePicker', function DateRangePicker(props, ref) {
  props = useFieldControl(props);   // the props a surrounding Field hands it, at any depth
  const sds = useSettings(words);
  const { value: _v, defaultValue: _d, onValueChange, onInvalidInput, min: minIn, max: maxIn, isDateDisabled, locale: localeProp, weekStartsOn, size: _s, invalid: _i, disabled, readOnly, required: requiredProp, id, startLabel, endLabel, startName, endName, form, buttonLabel, months: _m, presets: presetsProp, autoFocus, className, ...rest } = props;
  const locale = useLocale(localeProp);
  const size = oneOf(SIZES, props.size, 'md');
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  const describedBy = rest['aria-describedby'], required = rest['aria-required'] ?? (requiredProp || undefined);
  const errorMessage = rest['aria-errormessage'];
  delete rest['aria-describedby']; delete rest['aria-required']; delete rest['aria-errormessage'];
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<DateRange>(norm(props.defaultValue));
  const value = controlled ? norm(props.value) : own;
  const min = toDay(minIn, 'DateRangePicker') || undefined, max = toDay(maxIn, 'DateRangePicker') || undefined;
  const fmt = (d: Date | null) => (d ? formatDate(d, locale) : '');
  const [text, setText] = React.useState({ start: fmt(value.start), end: fmt(value.end) });
  const shown = React.useRef({ start: key(value.start), end: key(value.end) });
  const shownLocale = React.useRef(locale);   // a new locale (the browser's, after hydration) rewrites the text too
  if (key(value.start) !== shown.current.start || key(value.end) !== shown.current.end || locale !== shownLocale.current) {
    shown.current = { start: key(value.start), end: key(value.end) }; shownLocale.current = locale;
    const t = { start: fmt(value.start), end: fmt(value.end) };
    if (t.start !== text.start || t.end !== text.end) setText(t);
  }
  const [open, setOpen] = React.useState(false);
  const [picking, setPicking] = React.useState<'start' | 'end'>('start');
  const [hover, setHover] = React.useState<Date | null>(null);
  // With no start, today, or min or max when today is outside them, so the popup doesn't open on a month where
  // nothing can be picked (L8E79).
  const home = () => { const t = new Date(); return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t; };
  const [base, setBase] = React.useState(() => startOfMonth(value.start || home()));
  const popId = domId('dk-drp', React.useId());
  const [rejected, setRejected] = React.useState('');   // what was said about typed text put back, shown under the fields
  const box = React.useRef<HTMLSpanElement | null>(null);
  const startField = React.useRef<HTMLInputElement | null>(null);
  // ref.current.focus() and autoFocus land on the start field, as they would on a date input.
  const start = () => startField.current;
  useAutoFocus(autoFocus, start);
  useFormReset(startField, () => {
    if (controlled) return;
    const r = norm(props.defaultValue);
    shown.current = { start: key(r.start), end: key(r.end) }; setOwn(r); setText({ start: fmt(r.start), end: fmt(r.end) }); setOpen(false); setPicking('start');
  });
  const button = React.useRef<HTMLButtonElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const two = props.months !== 1;

  const allowed = (d: Date) => !(min && compare(d, min) < 0) && !(max && compare(d, max) > 0) && !(isDateDisabled && isDateDisabled(d));
  const commit = (r: DateRange) => {
    shown.current = { start: key(r.start), end: key(r.end) };
    setText({ start: fmt(r.start), end: fmt(r.end) });
    if (key(r.start) === key(value.start) && key(r.end) === key(value.end)) return;
    if (!controlled) setOwn(r);
    if (onValueChange) onValueChange(r, { start: r.start ? isoDate(r.start) : null, end: r.end ? isoDate(r.end) : null });
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
  const close = (focus: boolean) => { setOpen(false); setHover(null); if (focus && startField.current) startField.current.focus(); };
  const show = () => {
    const typed = parseDate(text.start, locale);
    setBase(startOfMonth((typed && allowed(typed) ? typed : null) || value.start || home()));
    setPicking(value.start && !value.end ? 'end' : 'start');
    setOpen(true);
  };
  // The calendar stays (inert) while the popup fades out (DZ1).
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, box, { placement: 'bottom-start', offsetVar: '--dk-drp-offset', onOutside: () => close(false), onFocusOutside: () => close(false), inside: button });

  const pick = (d: Date) => {
    if (picking === 'start' || !value.start || compare(d, value.start) < 0) { commit({ start: d, end: null }); setPicking('end'); return; }
    commit({ start: value.start, end: d });
    close(true);
  };
  const to = picking === 'end' && value.start && !value.end && hover && compare(hover, value.start) > 0 ? hover : value.end;
  const dayClass = (d: Date) => {
    const s = value.start;
    if (!s || !to) return undefined;
    if (compare(d, s) > 0 && compare(d, to) < 0) return 'dk-calendar__day--in-range';
    return undefined;
  };
  const isSel = (d: Date) => sameDay(d, value.start) || sameDay(d, value.end);
  const off = !!disabled || !!readOnly;
  const presets: PresetItem[] | null = presetsProp === true ? rangePresets(sds.labels, max)
    : Array.isArray(presetsProp) && presetsProp.length ? presetsProp.map((p) => { const r = norm(typeof p.value === 'function' ? p.value() : p.value); return { label: p.label, ...r }; }) : null;
  // A preset sets both ends and brings its start's month into view; the popup stays open to show it (RU11).
  const choose = (it: PresetItem) => { commit({ start: it.start, end: it.end }); if (it.start) setBase(startOfMonth(it.start)); setPicking('start'); setHover(null); };
  const field = (which: 'start' | 'end') => (
    <input type="text" inputMode="numeric" autoComplete="off" className="dk-input__field dk-date-range-picker__field"
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
  const cal = (m: Date, first: boolean) => (
    <Calendar month={m} onMonthChange={(n) => setBase(first ? n : addMonths(n, -1))} value={first ? value.start : value.end}
      min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} weekStartsOn={weekStartsOn} autoFocus={first} hideOutside={two}
      isDateSelected={isSel} dayClassName={dayClass} onDayHover={setHover} onValueChange={pick} />
  );
  const mergedRef = useMergedRef(ref, (n) => { box.current = n; delegateFocus(n, start); });
  return (
    <>
    <span {...rest} ref={mergedRef} role="group"
      className={cn('dk-input', 'dk-input--size-' + size, 'dk-date-range-picker', invalid && 'dk-input--invalid', disabled && 'dk-input--disabled', readOnly && 'dk-input--readonly', className)}
      data-component="date-range-picker" data-state={open ? 'open' : 'closed'} data-size={size}>
      {field('start')}
      <span className="dk-date-range-picker__dash" aria-hidden>–</span>
      <span id={popId + '-format'} hidden>{sds.labels.formatHint(datePattern(locale))}</span>
      {field('end')}
      <button ref={button} type="button" className="dk-date-picker__button dk-date-range-picker__button" aria-label={buttonLabel || sds.labels.chooseDates} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popId : undefined}
        disabled={off} onClick={() => { if (open) close(false); else { read('start'); show(); } }}>
        <Icon icon={icons.DateRange} />
      </button>
      {startName ? <input type="hidden" name={startName} form={form} value={value.start ? isoDate(value.start) : ''} disabled={disabled} /> : null}
      {endName ? <input type="hidden" name={endName} form={form} value={value.end ? isoDate(value.end) : ''} disabled={disabled} /> : null}
      <div ref={panel} id={popId} role="dialog" aria-label={buttonLabel || sds.labels.chooseDates} {...{ popover: 'manual' }} hidden={!open || undefined} inert={!open || undefined} data-instant={exit.instant ? '' : undefined} className="dk-date-picker__popup dk-date-range-picker__popup"
        onKeyDown={(e) => { if (e.key === 'Escape' && !isComposing(e)) { e.preventDefault(); e.stopPropagation(); close(true); } }}
        onMouseLeave={() => setHover(null)}>
        {open || exit.leaving ? <>
          {presets ? <div className="dk-date-range-picker__body">
            <div className="dk-date-range-picker__months">{cal(base, true)}{two ? cal(addMonths(base, 1), false) : null}</div>
            <PresetList label={sds.labels.presets} items={presets} allowed={allowed} current={value} onPick={choose} />
          </div> : <div className="dk-date-range-picker__months">{cal(base, true)}{two ? cal(addMonths(base, 1), false) : null}</div>}
          <p className="dk-date-range-picker__status" aria-live="polite">{picking === 'start' ? sds.labels.chooseStartDate : sds.labels.chooseEndDate}</p>
        </> : null}
      </div>
    </span>
      {/* Why typed text was put back (GR232): until the text changes; said out loud already, and read with the field. */}
      {rejected && <span id={popId + '-rejected'} className="dk-input-rejected">{rejected}</span>}
    </>
  );
});
