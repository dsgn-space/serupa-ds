// src/internal/validity.ts
import * as React from "react";
import { useLocale, useSettings } from "./provider.js";
import { en as inputWords } from "../components/Input/labels.js";
var REASONS = ["valueMissing", "typeMismatch", "badInput", "tooShort", "tooLong", "rangeUnderflow", "rangeOverflow", "stepMismatch", "patternMismatch"];
function useValidityMessages(props, own) {
  const rest = { ...props };
  const say = useSettings(inputWords).labels.invalidValue;
  const locale = useLocale();
  const ours = React.useRef(false);
  const clear = (el) => {
    if (el && ours.current) {
      ours.current = false;
      el.setCustomValidity("");
    }
  };
  const invalid = rest.onInvalid, input = rest.onInput;
  rest.onInvalid = function(e) {
    if (invalid) invalid(e);
    const el = e.currentTarget;
    clear(el);
    if (e.defaultPrevented || el.validity.customError) return;
    const reason = REASONS.find((r) => el.validity[r]);
    if (!reason) return;
    const text = say({
      reason,
      type: el instanceof HTMLTextAreaElement ? "textarea" : el.type,
      length: el.value.length,
      minLength: el.minLength >= 0 ? el.minLength : void 0,
      maxLength: el.maxLength >= 0 ? el.maxLength : void 0,
      min: shown(attr(el, "min"), el.type, locale),
      max: shown(attr(el, "max"), el.type, locale),
      step: el.type === "number" || el.type === "range" ? shown(attr(el, "step"), el.type, locale) : attr(el, "step"),
      title: el.title
    });
    if (text) {
      el.setCustomValidity(text);
      ours.current = true;
    }
  };
  rest.onInput = function(e) {
    clear(e.currentTarget);
    if (input) input(e);
  };
  const value = rest.value;
  React.useEffect(() => {
    const el = own.current;
    if (el && ours.current) {
      ours.current = false;
      el.setCustomValidity("");
    }
  }, [value, own]);
  return rest;
}
var attr = (el, name) => el.getAttribute(name) || void 0;
function shown(v, type, locale) {
  if (v == null) return v;
  if (type === "number" || type === "range") {
    const n = Number(v);
    return v.trim() && isFinite(n) ? new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(n) : v;
  }
  const m = /^(\d{4,})-(\d\d)(?:-(\d\d))?(?:T(\d\d):(\d\d))?$|^(\d\d):(\d\d)(?::\d\d(?:\.\d+)?)?$/.exec(v);
  if (!m) return v;
  const at = m[6] ? new Date(2e3, 0, 1, +m[6], +m[7]) : new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1, m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
  const style = type === "date" && m[3] && !m[4] ? { dateStyle: "medium" } : type === "month" && !m[3] ? { year: "numeric", month: "long" } : type === "datetime-local" && m[4] ? { dateStyle: "medium", timeStyle: "short" } : type === "time" && m[6] ? { timeStyle: "short" } : null;
  return style && !isNaN(at.getTime()) ? new Intl.DateTimeFormat(locale, style).format(at) : v;
}
export {
  useValidityMessages
};
//# sourceMappingURL=validity.js.map
