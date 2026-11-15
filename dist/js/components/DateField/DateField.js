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
import { dateOrder, parseDate, isoDate } from "../../internal/dates.js";
import { latinDigits } from "../../internal/digits.js";
import { isComposing } from "../../internal/ime.js";
import { Input } from "../Input/Input.js";
import { en as words } from "./labels.js";
var OWN = { value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, order: 1, autoComplete: 1, name: 1, form: 1, disabled: 1, readOnly: 1, invalid: 1, size: 1, "aria-invalid": 1, "aria-required": 1, "aria-errormessage": 1, autoFocus: 1, className: 1 };
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
  if (missing.length) return { value: "", problem: missing.length === 3 ? "empty" : `missing-${missing[0] ?? "day"}`, parts: missing };
  const bad = ["day", "month", "year"].filter((k) => !/^\d+$/.test(t[k]) || k === "month" && (+t.month < 1 || +t.month > 12) || k === "day" && (+t.day < 1 || +t.day > 31));
  if (bad.length) return { value: "", problem: "not-a-date", parts: bad };
  const d = new Date(2e3, 0, 1);
  d.setFullYear(+t.year, +t.month - 1, +t.day);
  if (d.getMonth() !== +t.month - 1) return { value: "", problem: "not-a-date", parts: ["day"] };
  const value = isoDate(d);
  if (min && ISO.test(min) && value < min) return { value, problem: "before-min", parts: ["day", "month", "year"] };
  if (max && ISO.test(max) && value > max) return { value, problem: "after-max", parts: ["day", "month", "year"] };
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
  const marked = invalid ? now.parts.length ? now.parts : order : [];
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
      "aria-describedby": props["aria-describedby"],
      className: cn("dk-date-field", disabled && "dk-date-field--disabled", props.className),
      "data-component": "date-field"
    },
    /* @__PURE__ */ React.createElement(FieldContext.Provider, { value: null }, order.map((k) => /* @__PURE__ */ React.createElement("div", { key: k, className: cn("dk-date-field__part", "dk-date-field__part--" + k) }, /* @__PURE__ */ React.createElement("label", { className: "dk-date-field__label", htmlFor: `${base}-${k}` }, label[k]), /* @__PURE__ */ React.createElement(
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
        "aria-required": props["aria-required"],
        onChange: (e) => change({ ...parts, [k]: e.target.value }, "type"),
        onKeyDown: onKeyDown(k),
        onPaste
      }
    )))),
    props.name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: props.name, form: props.form, value: now.value, disabled }) : null
  );
});
export {
  DateField
};
//# sourceMappingURL=DateField.js.map
