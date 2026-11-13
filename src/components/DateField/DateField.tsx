'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { useFormReset } from '../../internal/useFormReset';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { FieldContext, useFieldControl } from '../../internal/field';
import { useFieldLabel } from '../../internal/fieldLabel';
import { delegateFocus, useAutoFocus } from '../../internal/focus';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { dateOrder, parseDate, isoDate } from '../../internal/dates';
import { latinDigits } from '../../internal/digits';
import { isComposing } from '../../internal/ime';
import { Input } from '../Input/Input';
import { en as words } from './labels';

/** One of the three boxes. */
export type DatePart = 'day' | 'month' | 'year';

/** What's wrong with what's typed, for the app's error message, or null when it's a real date within min and max.
 *  "empty": nothing typed. "missing-day", "missing-month", "missing-year": that box is empty, or the year has fewer
 *  than 4 digits. "not-a-date": every box is filled but they don't make a date (31 April, month 13, a letter).
 *  "before-min", "after-max": a real date outside min or max. */
export type DateFieldProblem = 'empty' | 'missing-day' | 'missing-month' | 'missing-year' | 'not-a-date' | 'before-min' | 'after-max';

/** What onValueChange tells besides the value. */
export interface DateFieldChangeDetails {
  /** What's in each box, as typed (digits in any script are read as 0–9). */
  day: string;
  month: string;
  year: string;
  /** What's wrong, or null for a real date within min and max. */
  problem: DateFieldProblem | null;
  /** The boxes the problem is in, for marking only those (all three for a date that's out of range). */
  parts: DatePart[];
  /** What changed it: typing in a box, a whole date pasted into one, or the form's reset. */
  reason: 'type' | 'paste' | 'reset';
}

export interface DateFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The date (controlled), as YYYY-MM-DD, or "" while the boxes don't make a date. Use with onValueChange. Setting ""
   *  empties the boxes only when they held a date: a part typed so far stays. */
  value?: string | undefined;
  /** The date at first (uncontrolled), as YYYY-MM-DD, such as one saved before; form.reset() goes back to it. */
  defaultValue?: string | undefined;
  /** Called on every change with the date as YYYY-MM-DD ("" until the boxes make a real date), and what's typed and
   *  what's wrong, so the app can word its error. A date outside min or max still comes as its value, with a problem. */
  onValueChange?: ((value: string, details: DateFieldChangeDetails) => void) | undefined;
  /** The earliest date that's right, as YYYY-MM-DD. Earlier ones say "before-min"; nothing stops them being typed. */
  min?: string | undefined;
  /** The latest date that's right, as YYYY-MM-DD. Later ones say "after-max". */
  max?: string | undefined;
  /** The boxes' order. Default: the locale's (day month year for id-ID and en-GB, month day year for en-US). */
  order?: 'dmy' | 'mdy' | 'ymd' | undefined;
  /** "bday" for a date of birth: the boxes ask the browser for bday-day, bday-month and bday-year, so it can fill
   *  them. Default: "off", as no other date has autofill fields. */
  autoComplete?: 'bday' | 'off' | undefined;
  /** Sends the date as YYYY-MM-DD with a form, in a hidden input ("" while the boxes don't make a date). */
  name?: string | undefined;
  /** The id of a form elsewhere on the page that the hidden input belongs to. */
  form?: string | undefined;
  /** Turns the three boxes off. */
  disabled?: boolean | undefined;
  /** Shows the date without letting it change: the boxes stay focusable and read out as read-only, and a form still sends the date, unlike disabled. A pasted date changes nothing either. */
  readOnly?: boolean | undefined;
  /** Marks the date invalid: aria-invalid and the danger border on the boxes the problem is in, or on all three.
   *  Field sets it from its error. */
  invalid?: boolean | undefined;
  /** The boxes' size, as Input's. Default: "md". */
  size?: 'sm' | 'md' | 'lg' | undefined;
}

const OWN = { value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, order: 1, autoComplete: 1, name: 1, form: 1, disabled: 1, readOnly: 1, invalid: 1, size: 1, 'aria-invalid': 1, 'aria-required': 1, 'aria-errormessage': 1, autoFocus: 1, className: 1 } as const;
type Parts = Record<DatePart, string>;
const NONE: Parts = { day: '', month: '', year: '' };
const ORDERS = { dmy: ['day', 'month', 'year'], mdy: ['month', 'day', 'year'], ymd: ['year', 'month', 'day'] } as const;
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const SEPARATOR = /^[/.\-\s]$/;

const partsOf = (iso: string | undefined): Parts => {
  const m = ISO.exec(iso || '');
  return m ? { day: String(Number(m[3])), month: String(Number(m[2])), year: m[1] ?? '' } : NONE;
};
// The date the boxes make, as YYYY-MM-DD, with what's wrong and where.
function read(p: Parts, min?: string, max?: string): { value: string; problem: DateFieldProblem | null; parts: DatePart[] } {
  const t = { day: latinDigits(p.day).trim(), month: latinDigits(p.month).trim(), year: latinDigits(p.year).trim() };
  if (!t.day && !t.month && !t.year) return { value: '', problem: 'empty', parts: ['day', 'month', 'year'] };
  const missing = (['day', 'month', 'year'] as const).filter((k) => !t[k] || (k === 'year' && /^\d{1,3}$/.test(t.year)));
  if (missing.length) return { value: '', problem: missing.length === 3 ? 'empty' : `missing-${missing[0] ?? 'day'}`, parts: missing };
  const bad = (['day', 'month', 'year'] as const).filter((k) => !/^\d+$/.test(t[k]) || (k === 'month' && (+t.month < 1 || +t.month > 12)) || (k === 'day' && (+t.day < 1 || +t.day > 31)));
  if (bad.length) return { value: '', problem: 'not-a-date', parts: bad };
  const d = new Date(2000, 0, 1);
  d.setFullYear(+t.year, +t.month - 1, +t.day);
  if (d.getMonth() !== +t.month - 1) return { value: '', problem: 'not-a-date', parts: ['day'] };   // 31 April, 29 February 2025
  const value = isoDate(d);
  if (min && ISO.test(min) && value < min) return { value, problem: 'before-min', parts: ['day', 'month', 'year'] };
  if (max && ISO.test(max) && value > max) return { value, problem: 'after-max', parts: ['day', 'month', 'year'] };
  return { value, problem: null, parts: [] };
}

/* DateField: a date people know by heart or copy from a document (a date of birth, a passport's expiry), as three
   labelled boxes, Day, Month and Year, in the locale's order, under one name: GOV.UK's date input. Typing is free:
   nothing is blocked or moved on its own, so a mistake can be read and fixed. A separator (/ . - or a space) typed
   after a number moves to the next box, and a whole date pasted into any box fills all three. The root is a group
   named by the Field's label and described by its hint and error; the boxes are numeric text fields (not
   type="number", which drops leading zeros and takes e and +). The value is YYYY-MM-DD; onValueChange's details say
   what's wrong (a missing part, not a date, out of range) and in which boxes, for the app's error message. */
/** A date typed as day, month and year in three boxes, for dates people know: a date of birth, a document's dates.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const DateField = /* @__PURE__ */ component<HTMLDivElement, DateFieldProps>('DateField', function DateField(given, ref) {
  const props = useFieldControl(given);
  const nameRef = useNameCheck('DateField', NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  const rest = omit(props, OWN);
  const sds = useSettings(words), L = sds.labels;
  const locale = useLocale();
  const base = domId('dk-df', React.useId());
  const root = React.useRef<HTMLDivElement | null>(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset;
  const invalid = isInvalid(props.invalid, props['aria-invalid']);
  const own = dateOrder(locale).filter((k): k is DatePart => k === 'day' || k === 'month' || k === 'year');
  const order: readonly DatePart[] = props.order && ORDERS[props.order] ? ORDERS[props.order] : own.length === 3 ? own : ORDERS.dmy;
  const controlled = props.value !== undefined;
  const [parts, setParts] = React.useState<Parts>(() => partsOf(controlled ? props.value : props.defaultValue));
  const now = read(parts, props.min, props.max);

  // Controlled: the boxes follow value when it's a date other than theirs, or "" while they make one.
  const want = props.value;
  React.useLayoutEffect(() => {
    if (want === undefined || want === now.value) return;
    if (want === '' && !now.value) return;
    setParts(partsOf(want));
  }, [want, now.value]);

  const tell = (p: Parts, reason: DateFieldChangeDetails['reason']) => {
    if (!props.onValueChange) return;
    const r = read(p, props.min, props.max);
    props.onValueChange(r.value, { day: p.day, month: p.month, year: p.year, problem: r.problem, parts: r.parts, reason });
  };
  const change = (p: Parts, reason: DateFieldChangeDetails['reason']) => { setParts(p); tell(p, reason); };

  useFormReset(root, () => {
    if (controlled) return;   // the app's value stays; a controlled field's reset is the app's, as with a native one
    change(partsOf(props.defaultValue), 'reset');
  }, props.form);

  const box = (k: DatePart) => root.current && root.current.querySelector<HTMLInputElement>(`#${base}-${k}`);
  const firstBox = () => box(order[0] ?? 'day');
  useAutoFocus(props.autoFocus, firstBox);

  const onKeyDown = (k: DatePart) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing(e) || !SEPARATOR.test(e.key)) return;
    const i = order.indexOf(k), next = order[i + 1];
    // A separator after a number moves on; in an empty box, or the last one, it's ignored.
    e.preventDefault();
    if (next && parts[k].trim()) box(next)?.focus();
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (props.readOnly) return;   // the box's own readonly keeps the paste out
    const text = e.clipboardData.getData('text');
    if (!/\d\D+\d|^\s*\d{8}\s*$|\p{L}{3}/u.test(text)) return;   // a number alone goes in the box as usual
    const d = parseDate(text, locale);
    if (!d) return;
    e.preventDefault();
    change(partsOf(isoDate(d)), 'paste');
    box(order[order.length - 1] ?? 'year')?.focus();
  };

  const marked = invalid ? (now.parts.length ? now.parts : order) : [];
  const labelledBy = props['aria-labelledby'] || (props['aria-label'] ? undefined : fieldLabel);
  const label = { day: L.dateFieldDay, month: L.dateFieldMonth, year: L.dateFieldYear };
  return (
    <div {...rest} ref={(n) => { root.current = n; delegateFocus(n, firstBox); setRef(ref, n); nameRef(n); }} role="group"
      aria-labelledby={labelledBy} aria-describedby={props['aria-describedby']}
      className={cn('dk-date-field', disabled && 'dk-date-field--disabled', props.className)} data-component="date-field">
      <FieldContext.Provider value={null}>
        {order.map((k) => (
          <div key={k} className={cn('dk-date-field__part', 'dk-date-field__part--' + k)}>
            <label className="dk-date-field__label" htmlFor={`${base}-${k}`}>{label[k]}</label>
            <Input id={`${base}-${k}`} className="dk-date-field__input" size={props.size} inputMode="numeric" spellCheck={false}
              autoComplete={props.autoComplete === 'bday' ? `bday-${k}` : 'off'} maxLength={k === 'year' ? 4 : 2}
              value={parts[k]} disabled={disabled} readOnly={props.readOnly} invalid={marked.includes(k) || undefined}
              aria-required={props['aria-required']}
              onChange={(e) => change({ ...parts, [k]: e.target.value }, 'type')} onKeyDown={onKeyDown(k)} onPaste={onPaste} />
          </div>
        ))}
      </FieldContext.Provider>
      {props.name ? <input type="hidden" name={props.name} form={props.form} value={now.value} disabled={disabled} /> : null}
    </div>
  );
});
