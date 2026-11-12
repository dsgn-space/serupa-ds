import * as React from 'react';
import type { ValidityProblem } from '../components/Input/labels';
import { useLocale, useSettings } from './provider';
import { en as inputWords } from '../components/Input/labels';

type Field = HTMLInputElement | HTMLTextAreaElement;
const REASONS: ValidityProblem['reason'][] = ['valueMissing', 'typeMismatch', 'badInput', 'tooShort', 'tooLong', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'patternMismatch'];

/* The browser's message for a failed native constraint, in the provider's words (invalidValue, 216). It's set in
   the invalid event, which fires just before the browser shows the message, and only when nothing else set a
   custom one; it's cleared on the next input, or when a controlled value changes, so the field is judged by its
   constraints again. `ours` marks a field holding our message rather than the product's own setCustomValidity. */
export function useValidityMessages<P extends { onInvalid?: React.FormEventHandler<E>; onInput?: React.FormEventHandler<E>; value?: unknown }, E extends Field>(props: P, own: React.RefObject<E | null>): P {
  const rest: P = { ...props };   // a copy with the handlers in place, returned
  const say = useSettings(inputWords).labels.invalidValue;
  const locale = useLocale();
  const ours = React.useRef(false);
  const clear = (el: E | null) => { if (el && ours.current) { ours.current = false; el.setCustomValidity(''); } };
  const invalid = rest.onInvalid, input = rest.onInput;
  rest.onInvalid = function (e) {
    if (invalid) invalid(e);
    const el = e.currentTarget;
    clear(el);
    if (e.defaultPrevented || el.validity.customError) return;
    const reason = REASONS.find((r) => el.validity[r]);
    if (!reason) return;
    const text = say({ reason, type: el instanceof HTMLTextAreaElement ? 'textarea' : el.type, length: el.value.length,
      minLength: el.minLength >= 0 ? el.minLength : undefined, maxLength: el.maxLength >= 0 ? el.maxLength : undefined,
      min: shown(attr(el, 'min'), el.type, locale), max: shown(attr(el, 'max'), el.type, locale), step: el.type === 'number' || el.type === 'range' ? shown(attr(el, 'step'), el.type, locale) : attr(el, 'step'), title: el.title });
    if (text) { el.setCustomValidity(text); ours.current = true; }
  };
  rest.onInput = function (e) { clear(e.currentTarget); if (input) input(e); };
  const value = rest.value;
  React.useEffect(() => {
    const el = own.current;
    if (el && ours.current) { ours.current = false; el.setCustomValidity(''); }
  }, [value, own]);
  return rest;
}
const attr = (el: Field, name: string) => el.getAttribute(name) || undefined;

/* A min, max or step as the message's reader writes it, not as the attribute holds it: "1.000" in de-DE, "١٠٠٠" in
   ar-EG, and a date, month or time in the locale's own form ("11 nov. 2026", not "2026-11-11"). A value that isn't
   one of those (a step of "any", a week) stays as it is. */
function shown(v: string | undefined, type: string, locale: string): string | undefined {
  if (v == null) return v;
  if (type === 'number' || type === 'range') { const n = Number(v); return v.trim() && isFinite(n) ? new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(n) : v; }
  const m = /^(\d{4,})-(\d\d)(?:-(\d\d))?(?:T(\d\d):(\d\d))?$|^(\d\d):(\d\d)(?::\d\d(?:\.\d+)?)?$/.exec(v);
  if (!m) return v;
  const at = m[6] ? new Date(2000, 0, 1, +m[6], Number(m[7])) : new Date(Number(m[1]), Number(m[2]) - 1, m[3] ? +m[3] : 1, m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
  const style: Intl.DateTimeFormatOptions | null = type === 'date' && m[3] && !m[4] ? { dateStyle: 'medium' }
    : type === 'month' && !m[3] ? { year: 'numeric', month: 'long' }
    : type === 'datetime-local' && m[4] ? { dateStyle: 'medium', timeStyle: 'short' }
    : type === 'time' && m[6] ? { timeStyle: 'short' } : null;
  return style && !isNaN(at.getTime()) ? new Intl.DateTimeFormat(locale, style).format(at) : v;
}
