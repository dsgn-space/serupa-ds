"use client";

// src/components/DatePicker/DatePicker.tsx
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { pressFocuses } from "../../internal/affix.js";
import { useMergedRef, cn, domId, isInvalid, oneOf, SIZES } from "../../internal/cn.js";
import { compare, datePattern, formatDate, isoDate, parseDate, toDay } from "../../internal/dates.js";
import { reject } from "../../internal/rejectInput.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { Calendar } from "../Calendar/Calendar.js";
import { InputAction } from "../Input/Input.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import * as icons from "../../material/builtin.js";
import { isComposing } from "../../internal/ime.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { en as words } from "./labels.js";
import { windowBlur } from "../../internal/focus.js";
import { useControllable } from "../../internal/controllable.js";
import { useOpenState } from "../../internal/openChange.js";
function DatePickerRender({
  ref,
  ...props
}) {
  const nameRef = useNameCheck("DatePicker", NAME_HOW.field);
  props = useFieldControl(props);
  const sds = useSettings(words);
  const {
    value: _v,
    defaultValue: _d,
    onValueChange,
    open: _o,
    defaultOpen: _do,
    onOpenChange,
    onInvalidInput,
    min: minIn,
    max: maxIn,
    isDateDisabled,
    locale: localeProp,
    calendar,
    weekStartsOn,
    weekNumbers,
    size: _s,
    invalid: _i,
    buttonLabel,
    presets,
    className,
    style,
    name,
    placeholder,
    disabled,
    readOnly,
    onBlur,
    onKeyDown,
    ...rest
  } = props;
  const locale = useLocale(localeProp), lang = useOwnLang(localeProp);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const [held, setOwn, controlled] = useControllable(props.value, toDay(props.defaultValue, "DatePicker"), "DatePicker", "value");
  const value = controlled ? toDay(held, "DatePicker") : held;
  const min = toDay(minIn, "DatePicker") || void 0, max = toDay(maxIn, "DatePicker") || void 0;
  const [text, setText] = React.useState(value ? formatDate(value, locale) : "");
  const off = !!disabled || !!readOnly;
  const [open, setOpen] = useOpenState(props.open, props.defaultOpen, onOpenChange, "DatePicker", off);
  const [focusIn, setFocusIn] = React.useState(false);
  const openByHand = () => {
    setFocusIn(true);
    setOpen(true, "trigger");
  };
  const id = domId("srp-dp", React.useId());
  const field = React.useRef(null);
  const button = React.useRef(null);
  const box = React.useRef(null);
  const panel = React.useRef(null);
  const shown = React.useRef(value ? value.getTime() : null);
  useFormReset(field, () => {
    if (controlled) return;
    const d = toDay(props.defaultValue);
    shown.current = d ? d.getTime() : null;
    setOwn(d);
    setText(d ? formatDate(d, locale) : "");
    setOpen(false, "api");
  });
  const shownLocale = React.useRef(locale);
  if ((value ? value.getTime() : null) !== shown.current || locale !== shownLocale.current) {
    shown.current = value ? value.getTime() : null;
    shownLocale.current = locale;
    const t = value ? formatDate(value, locale) : "";
    if (t !== text) setText(t);
  }
  const allowed = (d_0) => !(min && compare(d_0, min) < 0) && !(max && compare(d_0, max) > 0) && !(isDateDisabled && isDateDisabled(d_0));
  const commit = (d_1) => {
    shown.current = d_1 ? d_1.getTime() : null;
    setText(d_1 ? formatDate(d_1, locale) : "");
    if ((d_1 ? d_1.getTime() : null) === (value ? value.getTime() : null)) return;
    if (!controlled) setOwn(d_1);
    if (onValueChange) onValueChange(d_1, {
      iso: d_1 ? isoDate(d_1) : null
    });
  };
  const [rejected, setRejected] = React.useState("");
  const read = () => {
    if (text.trim() === "") return commit(null);
    const d_2 = parseDate(text, locale);
    if (d_2 && allowed(d_2)) return commit(d_2);
    reject(text, d_2 ? "unavailable" : "unreadable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
    commit(value);
  };
  const close = (focusField, reason) => {
    setOpen(false, reason);
    setFocusIn(false);
    if (focusField && field.current) field.current.focus();
  };
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, box, {
    placement: "bottom-start",
    offsetVar: "--srp-dp-offset",
    onOutside: () => close(false, "outside"),
    onFocusOutside: () => close(false, "blur"),
    inside: button
  });
  const typed = parseDate(text, locale);
  const mergedRef = useMergedRef(ref, (n) => {
    field.current = n;
    nameRef(n);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { ref: box, className: cn("srp-input", "srp-input--size-" + size, "srp-date-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className), style, "data-component": "date-picker", "data-state": open ? "open" : "closed", "data-size": size, onMouseDown: pressFocuses(field) }, /* @__PURE__ */ React.createElement("input", { ...rest, ref: mergedRef, lang: rest.lang ?? lang, type: "text", inputMode: "numeric", autoComplete: rest.autoComplete || "off", className: "srp-input__field", value: text, disabled, readOnly, placeholder: placeholder != null ? placeholder : datePattern(locale), "aria-invalid": invalid || void 0, "aria-describedby": cn(rest["aria-describedby"], id + "-format", rejected && id + "-rejected"), onChange: (e) => {
    setText(e.target.value);
    setRejected("");
  }, onBlur: (e_0) => {
    if (!windowBlur(e_0)) read();
    if (onBlur) onBlur(e_0);
  }, onKeyDown: (e_1) => {
    if (onKeyDown) onKeyDown(e_1);
    if (e_1.defaultPrevented || isComposing(e_1)) return;
    if (e_1.key === "Enter") read();
    else if (e_1.key === "ArrowDown" && e_1.altKey && !off) {
      e_1.preventDefault();
      read();
      openByHand();
    }
  } }), /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, /* @__PURE__ */ React.createElement(InputAction, { ref: button, className: "srp-date-picker__button", icon: icons.CalendarToday, label: buttonLabel || sds.labels.chooseDate, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? id : void 0, disabled: off, onClick: () => {
    if (open) close(false, "trigger");
    else {
      read();
      openByHand();
    }
  } })), /* @__PURE__ */ React.createElement("span", { id: id + "-format", hidden: true }, sds.labels.formatHint(datePattern(locale))), name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name, form: rest.form, value: value ? isoDate(value) : "", disabled }) : null, /* @__PURE__ */ React.createElement("div", { ref: panel, id, role: "dialog", "aria-label": buttonLabel || sds.labels.chooseDate, ...{
    popover: "manual"
  }, hidden: !open || void 0, inert: !open || void 0, "data-instant": exit.instant ? "" : void 0, className: "srp-date-picker__popup", onKeyDown: (e_2) => {
    if (e_2.key === "Escape" && !isComposing(e_2)) {
      e_2.preventDefault();
      e_2.stopPropagation();
      close(true, "escape");
    }
  } }, open || exit.leaving ? /* @__PURE__ */ React.createElement(Calendar, { value, defaultMonth: (typed && allowed(typed) ? typed : null) || value || void 0, min, max, isDateDisabled, locale, calendar, weekStartsOn, weekNumbers, presets, autoFocus: focusIn, onValueChange: (d_3) => {
    commit(d_3);
    close(true, "select");
  } }) : null)), rejected && /* @__PURE__ */ React.createElement("span", { id: id + "-rejected", className: "srp-input-rejected" }, rejected));
}
var DatePicker = /* @__PURE__ */ named("DatePicker", DatePickerRender);
export {
  DatePicker
};
//# sourceMappingURL=DatePicker.js.map
