'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, setRef } from '../../internal/cn';
import { named } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { useFormReset } from '../../internal/useFormReset';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { FieldContext, useFieldControl } from '../../internal/field';
import { useFieldLabel } from '../../internal/fieldLabel';
import { delegateFocus, useAutoFocus } from '../../internal/focus';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { dateOrder, parseDate, isoDate, toDay } from '../../internal/dates';
import { latinDigits } from '../../internal/digits';
import { isComposing } from '../../internal/ime';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';
import { en as words, type DateFieldMessage } from './labels';

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
  /** A date must be given: aria-required on the boxes, and a form isn't sent while they're empty (they're marked and
   *  the first takes focus; a Field's error says why). In a required Field, aria-required is set for you. */
  required?: boolean | undefined;
  /** Turns the three boxes off. */
  disabled?: boolean | undefined;
  /** Shows the date without letting it change: the boxes stay focusable and read out as read-only, and a form still sends the date, unlike disabled. A pasted date changes nothing either. */
  readOnly?: boolean | undefined;
  /** Marks the date invalid: aria-invalid and the danger border on the boxes the problem is in, or on all three.
   *  Field sets it from its error. */
  invalid?: boolean | undefined;
  /** The boxes' size, as Input's. Default: "md". */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** The month as a number box ("number", the default) or a menu of the locale's month names ("select"), for people
   *  who know the month by name. The value is the same either way. */
  monthInput?: 'number' | 'select' | undefined;
}

const OWN = { value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, order: 1, autoComplete: 1, name: 1, form: 1, required: 1, disabled: 1, readOnly: 1, invalid: 1, size: 1, 'aria-invalid': 1, 'aria-required': 1, 'aria-errormessage': 1, autoFocus: 1, className: 1, monthInput: 1 } as const;
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
function read(p: Parts, min?: string, max?: string): { value: string; problem: DateFieldProblem | null; parts: DatePart[]; why?: DateFieldMessage; at?: DatePart[] } {
  const t = { day: latinDigits(p.day).trim(), month: latinDigits(p.month).trim(), year: latinDigits(p.year).trim() };
  if (!t.day && !t.month && !t.year) return { value: '', problem: 'empty', parts: ['day', 'month', 'year'] };
  const missing = (['day', 'month', 'year'] as const).filter((k) => !t[k] || (k === 'year' && /^\d{1,3}$/.test(t.year)));
  // The message is about the first box, in day, month, year order, that's wrong: an empty one, a day or month out of
  // range or not a number, a year short of 4 digits.
  let why: DateFieldMessage | undefined, at: DatePart = 'day';
  for (const k of ['day', 'month', 'year'] as const) {
    const v = t[k], n = +v;
    why = !v ? `missing-${k}` : !/^\d+$/.test(v) || (k === 'day' && (n < 1 || n > 31)) || (k === 'month' && (n < 1 || n > 12)) || (k === 'year' && v.length < 4) ? k : undefined;
    if (why) { at = k; break; }
  }
  if (missing.length) return { value: '', problem: missing.length === 3 ? 'empty' : `missing-${missing[0] ?? 'day'}`, parts: missing, why, at: [at] };
  const bad = (['day', 'month', 'year'] as const).filter((k) => !/^\d+$/.test(t[k]) || (k === 'month' && (+t.month < 1 || +t.month > 12)) || (k === 'day' && (+t.day < 1 || +t.day > 31)));
  if (bad.length) return { value: '', problem: 'not-a-date', parts: bad, why, at: [at] };
  const d = new Date(2000, 0, 1);
  d.setFullYear(+t.year, +t.month - 1, +t.day);
  if (d.getMonth() !== +t.month - 1) return { value: '', problem: 'not-a-date', parts: ['day'], why: 'not-real', at: ['day'] };   // 31 April, 29 February 2025
  const value = isoDate(d);
  if (min && ISO.test(min) && value < min) return { value, problem: 'before-min', parts: ['day', 'month', 'year'], why: 'before-min', at: ['day', 'month', 'year'] };
  if (max && ISO.test(max) && value > max) return { value, problem: 'after-max', parts: ['day', 'month', 'year'], why: 'after-max', at: ['day', 'month', 'year'] };
  return { value, problem: null, parts: [] };
}

function DateFieldRender({ ref, ...given }: DateFieldProps & React.RefAttributes<HTMLDivElement>) {
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
  // required: a form sent with all three boxes empty marks them, until something is typed.
  const required = !!props.required;
  const [missing, setMissing] = React.useState(false);
  if (missing && now.problem !== 'empty') setMissing(false);
  const ariaRequired = props['aria-required'] ?? (required || undefined);
  // What's wrong, in words, under the boxes: once focus has left the date or the form was sent, then as it's fixed.
  // Not while the first entry is typed, and not when the app marks it invalid (a Field's error says it instead).
  const [checked, setChecked] = React.useState(false);
  const outer = invalid;
  const message = React.useMemo(() => {
    const why = now.why;
    if (!why) return '';
    const g = { calendar: 'gregory', numberingSystem: 'latn' } as const;
    if (why === 'not-real') {
      const m = new Date(2000, 0, 1); m.setFullYear(+latinDigits(parts.year), +latinDigits(parts.month) - 1, 1);
      return L.dateFieldError(why, new Intl.DateTimeFormat(locale, { ...g, month: 'long', year: 'numeric' }).format(m), new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate());
    }
    if (why === 'before-min' || why === 'after-max') {
      const at = toDay(why === 'before-min' ? props.min : props.max);
      return L.dateFieldError(why, at ? new Intl.DateTimeFormat(locale, { ...g, day: 'numeric', month: 'long', year: 'numeric' }).format(at) : undefined);
    }
    return L.dateFieldError(why);
  }, [now.why, parts.year, parts.month, props.min, props.max, locale, L]);
  const said = checked && !outer && message ? message : '';

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

  const marked = invalid || missing ? (now.parts.length ? now.parts : order) : said ? now.at ?? [] : [];
  // Each box takes digits only (any script's, read as 0–9), up to 2, 2 and 4: a letter typed or pasted is dropped.
  const digits = (k: DatePart, v: string) => latinDigits(v).replace(/\D/g, '').slice(0, k === 'year' ? 4 : 2);
  // A form isn't sent while the boxes make a wrong date: the first box carries the message as its validity, and the
  // browser's own bubble gives way to the message under the boxes, with focus on the box to fix.
  const firstWrong = (now.at && now.at[0]) || null;
  // every render: the message follows what's typed.
  React.useEffect(() => {
    const b = firstBox();
    if (b && 'setCustomValidity' in b) b.setCustomValidity(message);
  });
  // Focus leaving shows the message, but a press that took focus away (on Next, on Send) is let go first: the message
  // line would move what's under the pointer, and the click would miss it.
  const check = () => {
    if (!pressed.current) { setChecked(true); return; }
    const later = () => { window.removeEventListener('click', later, true); window.removeEventListener('pointercancel', later, true); setTimeout(() => setChecked(true)); };
    window.addEventListener('click', later, true); window.addEventListener('pointercancel', later, true);
  };
  const pressed = React.useRef(false);
  React.useEffect(() => {
    const down = () => { pressed.current = true; }, up = () => { pressed.current = false; };
    window.addEventListener('pointerdown', down, true); window.addEventListener('click', up, true);
    return () => { window.removeEventListener('pointerdown', down, true); window.removeEventListener('click', up, true); };
  }, []);
  const onInvalid = (e: React.FormEvent) => {
    e.preventDefault(); setChecked(true);
    if (now.problem === 'empty') { setMissing(true); firstBox()?.focus(); } else if (firstWrong) box(firstWrong)?.focus();
  };
  const errorId = base + '-error';
  const months = React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: f.format(new Date(2000, i, 1)) }));
  }, [locale]);
  const labelledBy = props['aria-labelledby'] || (props['aria-label'] ? undefined : fieldLabel);
  const label = { day: L.dateFieldDay, month: L.dateFieldMonth, year: L.dateFieldYear };
  return (
    <div {...rest} ref={(n) => { root.current = n; delegateFocus(n, firstBox); setRef(ref, n); nameRef(n); }} role="group"
      aria-labelledby={labelledBy} aria-describedby={cn(props['aria-describedby'], said && errorId) || undefined}
      onBlur={(e) => { if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) && (parts.day || parts.month || parts.year)) check(); }}
      className={cn('dk-date-field', disabled && 'dk-date-field--disabled', props.className)} data-component="date-field">
      <FieldContext.Provider value={null}>
        {order.map((k) => (
          <div key={k} className={cn('dk-date-field__part', 'dk-date-field__part--' + k)}>
            <label className="dk-date-field__label" htmlFor={`${base}-${k}`}>{label[k]}</label>
            {k === 'month' && props.monthInput === 'select'
              ? <Select id={`${base}-${k}`} className="dk-date-field__input dk-date-field__input--select" size={props.size} options={months} placeholder={L.dateFieldMonth}
                autoComplete={props.autoComplete === 'bday' ? 'bday-month' : 'off'} value={parts.month} disabled={disabled} readOnly={props.readOnly} required={k === order[0] && required} onInvalid={k === order[0] ? onInvalid : undefined}
                invalid={marked.includes(k) || undefined} aria-required={ariaRequired} aria-describedby={marked.includes(k) && said ? errorId : undefined}
                onChange={(e) => change({ ...parts, month: e.target.value }, 'type')} />
              : <Input id={`${base}-${k}`} className="dk-date-field__input" size={props.size} inputMode="numeric" spellCheck={false}
                autoComplete={props.autoComplete === 'bday' ? `bday-${k}` : 'off'} maxLength={k === 'year' ? 4 : 2}
                value={parts[k]} disabled={disabled} readOnly={props.readOnly} invalid={marked.includes(k) || undefined}
                aria-required={ariaRequired} aria-describedby={marked.includes(k) && said ? errorId : undefined}
                required={k === order[0] && required} onInvalid={k === order[0] ? onInvalid : undefined}
                onChange={(e) => change({ ...parts, [k]: digits(k, e.target.value) }, 'type')} onKeyDown={onKeyDown(k)} onPaste={onPaste} />}
          </div>
        ))}
      </FieldContext.Provider>
      {said ? <div className="dk-date-field__error"><Icon icon={icons.Error} className="dk-date-field__error-icon" /><span id={errorId}>{said}</span></div> : null}
      {props.name ? <input type="hidden" name={props.name} form={props.form} value={now.value} disabled={disabled} /> : null}
    </div>
  );
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
export const DateField = /* @__PURE__ */ named('DateField', DateFieldRender);
