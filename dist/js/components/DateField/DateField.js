"use client";

// src/components/DateField/DateField.tsx
import * as React from "react";
import { cn, domId, isInvalid, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import { useFieldsetDisabled } from "../../internal/useFieldsetDisabled.js";
import { FieldContext, useFieldControl } from "../../internal/field.js";
import { useFieldLabel } from "../../internal/fieldLabel.js";
import { delegateFocus, useAutoFocus } from "../../internal/focus.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { dateOrder, parseDate, isoDate, toDay } from "../../internal/dates.js";
import { latinDigits } from "../../internal/digits.js";
import { isComposing } from "../../internal/ime.js";
import { Input } from "../Input/Input.js";
import { Select } from "../Select/Select.js";
import { Icon } from "../Icon/Icon.js";
import * as icons from "../../material/builtin.js";
import { en as words } from "./labels.js";
var OWN = { value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, order: 1, autoComplete: 1, name: 1, form: 1, required: 1, disabled: 1, readOnly: 1, invalid: 1, size: 1, "aria-invalid": 1, "aria-required": 1, "aria-errormessage": 1, autoFocus: 1, className: 1, monthInput: 1 };
var NONE = { day: "", month: "", year: "" };
var ORDERS = { dmy: ["day", "month", "year"], mdy: ["month", "day", "year"], ymd: ["year", "month", "day"] };
var ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
var SEPARATOR = /^[/.\-\s]$/;
var partsOf = (iso) => {
  const m = ISO.exec(iso || "");
  return m ? { day: String(Number(m[3])), month: String(Number(m[2])), year: m[1] ?? "" } : NONE;
};
function read(p, min, max) {
  const t = { day: latinDigits(p.day).trim(), month: latinDigits(p.month).trim(), year: latinDigits(p.year).trim() };
  if (!t.day && !t.month && !t.year) return { value: "", problem: "empty", parts: ["day", "month", "year"] };
  const missing = ["day", "month", "year"].filter((k) => !t[k] || k === "year" && /^\d{1,3}$/.test(t.year));
  let why, at = "day";
  for (const k of ["day", "month", "year"]) {
    const v = t[k], n = +v;
    why = !v ? `missing-${k}` : !/^\d+$/.test(v) || k === "day" && (n < 1 || n > 31) || k === "month" && (n < 1 || n > 12) || k === "year" && v.length < 4 ? k : void 0;
    if (why) {
      at = k;
      break;
    }
  }
  if (missing.length) return { value: "", problem: missing.length === 3 ? "empty" : `missing-${missing[0] ?? "day"}`, parts: missing, why, at: [at] };
  const bad = ["day", "month", "year"].filter((k) => !/^\d+$/.test(t[k]) || k === "month" && (+t.month < 1 || +t.month > 12) || k === "day" && (+t.day < 1 || +t.day > 31));
  if (bad.length) return { value: "", problem: "not-a-date", parts: bad, why, at: [at] };
  const d = new Date(2e3, 0, 1);
  d.setFullYear(+t.year, +t.month - 1, +t.day);
  if (d.getMonth() !== +t.month - 1) return { value: "", problem: "not-a-date", parts: ["day"], why: "not-real", at: ["day"] };
  const value = isoDate(d);
  if (min && ISO.test(min) && value < min) return { value, problem: "before-min", parts: ["day", "month", "year"], why: "before-min", at: ["day", "month", "year"] };
  if (max && ISO.test(max) && value > max) return { value, problem: "after-max", parts: ["day", "month", "year"], why: "after-max", at: ["day", "month", "year"] };
  return { value, problem: null, parts: [] };
}
var DateField = /* @__PURE__ */ component("DateField", function DateField2(given, ref) {
  const props = useFieldControl(given);
  const nameRef = useNameCheck("DateField", NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  const rest = omit(props, OWN);
  const sds = useSettings(words), L = sds.labels;
  const locale = useLocale();
  const base = domId("dk-df", React.useId());
  const root = React.useRef(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset;
  const invalid = isInvalid(props.invalid, props["aria-invalid"]);
  const own = dateOrder(locale).filter((k) => k === "day" || k === "month" || k === "year");
  const order = props.order && ORDERS[props.order] ? ORDERS[props.order] : own.length === 3 ? own : ORDERS.dmy;
  const controlled = props.value !== void 0;
  const [parts, setParts] = React.useState(() => partsOf(controlled ? props.value : props.defaultValue));
  const now = read(parts, props.min, props.max);
  const required = !!props.required;
  const [missing, setMissing] = React.useState(false);
  if (missing && now.problem !== "empty") setMissing(false);
  const ariaRequired = props["aria-required"] ?? (required || void 0);
  const [checked, setChecked] = React.useState(false);
  const outer = invalid;
  const message = React.useMemo(() => {
    const why = now.why;
    if (!why) return "";
    const g = { calendar: "gregory", numberingSystem: "latn" };
    if (why === "not-real") {
      const m = new Date(2e3, 0, 1);
      m.setFullYear(+latinDigits(parts.year), +latinDigits(parts.month) - 1, 1);
      return L.dateFieldError(why, new Intl.DateTimeFormat(locale, { ...g, month: "long", year: "numeric" }).format(m), new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate());
    }
    if (why === "before-min" || why === "after-max") {
      const at = toDay(why === "before-min" ? props.min : props.max);
      return L.dateFieldError(why, at ? new Intl.DateTimeFormat(locale, { ...g, day: "numeric", month: "long", year: "numeric" }).format(at) : void 0);
    }
    return L.dateFieldError(why);
  }, [now.why, parts.year, parts.month, props.min, props.max, locale, L]);
  const said = checked && !outer && message ? message : "";
  const want = props.value;
  React.useLayoutEffect(() => {
    if (want === void 0 || want === now.value) return;
    if (want === "" && !now.value) return;
    setParts(partsOf(want));
  }, [want, now.value]);
  const tell = (p, reason) => {
    if (!props.onValueChange) return;
    const r = read(p, props.min, props.max);
    props.onValueChange(r.value, { day: p.day, month: p.month, year: p.year, problem: r.problem, parts: r.parts, reason });
  };
  const change = (p, reason) => {
    setParts(p);
    tell(p, reason);
  };
  useFormReset(root, () => {
    if (controlled) return;
    change(partsOf(props.defaultValue), "reset");
  }, props.form);
  const box = (k) => root.current && root.current.querySelector(`#${base}-${k}`);
  const firstBox = () => box(order[0] ?? "day");
  useAutoFocus(props.autoFocus, firstBox);
  const onKeyDown = (k) => (e) => {
    if (isComposing(e) || !SEPARATOR.test(e.key)) return;
    const i = order.indexOf(k), next = order[i + 1];
    e.preventDefault();
    if (next && parts[k].trim()) box(next)?.focus();
  };
  const onPaste = (e) => {
    if (props.readOnly) return;
    const text = e.clipboardData.getData("text");
    if (!/\d\D+\d|^\s*\d{8}\s*$|\p{L}{3}/u.test(text)) return;
    const d = parseDate(text, locale);
    if (!d) return;
    e.preventDefault();
    change(partsOf(isoDate(d)), "paste");
    box(order[order.length - 1] ?? "year")?.focus();
  };
  const marked = invalid || missing ? now.parts.length ? now.parts : order : said ? now.at ?? [] : [];
  const digits = (k, v) => latinDigits(v).replace(/\D/g, "").slice(0, k === "year" ? 4 : 2);
  const firstWrong = now.at && now.at[0] || null;
  React.useEffect(() => {
    const b = firstBox();
    if (b && "setCustomValidity" in b) b.setCustomValidity(message);
  });
  const check = () => {
    if (!pressed.current) {
      setChecked(true);
      return;
    }
    const later = () => {
      window.removeEventListener("click", later, true);
      window.removeEventListener("pointercancel", later, true);
      setTimeout(() => setChecked(true));
    };
    window.addEventListener("click", later, true);
    window.addEventListener("pointercancel", later, true);
  };
  const pressed = React.useRef(false);
  React.useEffect(() => {
    const down = () => {
      pressed.current = true;
    }, up = () => {
      pressed.current = false;
    };
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("click", up, true);
    return () => {
      window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("click", up, true);
    };
  }, []);
  const onInvalid = (e) => {
    e.preventDefault();
    setChecked(true);
    if (now.problem === "empty") {
      setMissing(true);
      firstBox()?.focus();
    } else if (firstWrong) box(firstWrong)?.focus();
  };
  const errorId = base + "-error";
  const months = React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: f.format(new Date(2e3, i, 1)) }));
  }, [locale]);
  const labelledBy = props["aria-labelledby"] || (props["aria-label"] ? void 0 : fieldLabel);
  const label = { day: L.dateFieldDay, month: L.dateFieldMonth, year: L.dateFieldYear };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: (n) => {
        root.current = n;
        delegateFocus(n, firstBox);
        setRef(ref, n);
        nameRef(n);
      },
      role: "group",
      "aria-labelledby": labelledBy,
      "aria-describedby": cn(props["aria-describedby"], said && errorId) || void 0,
      onBlur: (e) => {
        if (!(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) && (parts.day || parts.month || parts.year)) check();
      },
      className: cn("dk-date-field", disabled && "dk-date-field--disabled", props.className),
      "data-component": "date-field"
    },
    /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, order.map((k) => /* @__PURE__ */ React.createElement("div", { key: k, className: cn("dk-date-field__part", "dk-date-field__part--" + k) }, /* @__PURE__ */ React.createElement("label", { className: "dk-date-field__label", htmlFor: `${base}-${k}` }, label[k]), k === "month" && props.monthInput === "select" ? /* @__PURE__ */ React.createElement(
      Select,
      {
        id: `${base}-${k}`,
        className: "dk-date-field__input dk-date-field__input--select",
        size: props.size,
        options: months,
        placeholder: L.dateFieldMonth,
        autoComplete: props.autoComplete === "bday" ? "bday-month" : "off",
        value: parts.month,
        disabled,
        readOnly: props.readOnly,
        required: k === order[0] && required,
        onInvalid: k === order[0] ? onInvalid : void 0,
        invalid: marked.includes(k) || void 0,
        "aria-required": ariaRequired,
        "aria-describedby": marked.includes(k) && said ? errorId : void 0,
        onChange: (e) => change({ ...parts, month: e.target.value }, "type")
      }
    ) : /* @__PURE__ */ React.createElement(
      Input,
      {
        id: `${base}-${k}`,
        className: "dk-date-field__input",
        size: props.size,
        inputMode: "numeric",
        spellCheck: false,
        autoComplete: props.autoComplete === "bday" ? `bday-${k}` : "off",
        maxLength: k === "year" ? 4 : 2,
        value: parts[k],
        disabled,
        readOnly: props.readOnly,
        invalid: marked.includes(k) || void 0,
        "aria-required": ariaRequired,
        "aria-describedby": marked.includes(k) && said ? errorId : void 0,
        required: k === order[0] && required,
        onInvalid: k === order[0] ? onInvalid : void 0,
        onChange: (e) => change({ ...parts, [k]: digits(k, e.target.value) }, "type"),
        onKeyDown: onKeyDown(k),
        onPaste
      }
    )))),
    said ? /* @__PURE__ */ React.createElement("div", { className: "dk-date-field__error" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error, className: "dk-date-field__error-icon" }), /* @__PURE__ */ React.createElement("span", { id: errorId }, said)) : null,
    props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: now.value, disabled }) : null
  );
});
export {
  DateField
};
//# sourceMappingURL=DateField.js.map
