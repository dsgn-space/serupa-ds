"use client";

// src/components/DatePicker/DatePicker.tsx
import { c as _c } from "../../internal/memoCache.js";
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
function DatePickerRender(t0) {
  const $ = _c(85);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
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
  const locale = useLocale(localeProp);
  const lang = useOwnLang(localeProp);
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const [held, setOwn, controlled] = useControllable(props.value, toDay(props.defaultValue, "DatePicker"), "DatePicker", "value");
  const value = controlled ? toDay(held, "DatePicker") : held;
  const min = toDay(minIn, "DatePicker") || void 0;
  const max = toDay(maxIn, "DatePicker") || void 0;
  const [text, setText] = React.useState(value ? formatDate(value, locale) : "");
  const off = !!disabled || !!readOnly;
  const [open, setOpen] = useOpenState(props.open, props.defaultOpen, onOpenChange, "DatePicker", off);
  const [focusIn, setFocusIn] = React.useState(false);
  let t2;
  if ($[0] !== setOpen) {
    t2 = () => {
      setFocusIn(true);
      setOpen(true, "trigger");
    };
    $[0] = setOpen;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const openByHand = t2;
  const id = domId("srp-dp", React.useId());
  const field = React.useRef(null);
  const button = React.useRef(null);
  const box = React.useRef(null);
  const panel = React.useRef(null);
  const [seenAt, setSeenAt] = React.useState(value ? value.getTime() : null);
  const [seenLocale, setSeenLocale] = React.useState(locale);
  useFormReset(field, () => {
    if (controlled) {
      return;
    }
    const d = toDay(props.defaultValue);
    setSeenAt(d ? d.getTime() : null);
    setOwn(d);
    setText(d ? formatDate(d, locale) : "");
    setOpen(false, "api");
  });
  if ((value ? value.getTime() : null) !== seenAt || locale !== seenLocale) {
    setSeenAt(value ? value.getTime() : null);
    setSeenLocale(locale);
    const t = value ? formatDate(value, locale) : "";
    if (t !== text) {
      setText(t);
    }
  }
  const allowed = (d_0) => !(min && compare(d_0, min) < 0) && !(max && compare(d_0, max) > 0) && !(isDateDisabled && isDateDisabled(d_0));
  const commit = (d_1) => {
    setSeenAt(d_1 ? d_1.getTime() : null);
    setText(d_1 ? formatDate(d_1, locale) : "");
    if ((d_1 ? d_1.getTime() : null) === (value ? value.getTime() : null)) {
      return;
    }
    if (!controlled) {
      setOwn(d_1);
    }
    if (onValueChange) {
      onValueChange(d_1, {
        iso: d_1 ? isoDate(d_1) : null
      });
    }
  };
  const [rejected, setRejected] = React.useState("");
  const read = () => {
    if (text.trim() === "") {
      return commit(null);
    }
    const d_2 = parseDate(text, locale);
    if (d_2 && allowed(d_2)) {
      return commit(d_2);
    }
    reject(text, d_2 ? "unavailable" : "unreadable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
    commit(value);
  };
  let t3;
  if ($[2] !== setOpen) {
    t3 = (focusField, reason) => {
      setOpen(false, reason);
      setFocusIn(false);
      if (focusField && field.current) {
        field.current.focus();
      }
    };
    $[2] = setOpen;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const close = t3;
  const exit = useExit(open, panel);
  let t4;
  if ($[4] !== close) {
    t4 = {
      placement: "bottom-start",
      offsetVar: "--srp-dp-offset",
      onOutside: () => close(false, "outside"),
      onFocusOutside: () => close(false, "blur"),
      inside: button
    };
    $[4] = close;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  useAnchoredLayer(open, panel, box, t4);
  const typed = parseDate(text, locale);
  let t5;
  if ($[6] !== nameRef) {
    t5 = (n) => {
      field.current = n;
      nameRef(n);
    };
    $[6] = nameRef;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  const mergedRef = useMergedRef(ref, t5);
  const t6 = cn("srp-input", "srp-input--size-" + size, "srp-date-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className);
  const t7 = invalid ? "" : void 0;
  const t8 = disabled ? "" : void 0;
  const t9 = readOnly ? "" : void 0;
  const t10 = "date-picker";
  const t11 = open ? "open" : "closed";
  let t12;
  if ($[8] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t12 = (e) => pressFocuses(field)(e);
    $[8] = t12;
  } else {
    t12 = $[8];
  }
  const t13 = rest.lang ?? lang;
  const t14 = rest.autoComplete || "off";
  const t15 = placeholder != null ? placeholder : datePattern(locale);
  const t16 = invalid || void 0;
  const t17 = cn(rest["aria-describedby"], id + "-format", rejected && id + "-rejected");
  let t18;
  if ($[9] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t18 = (e_0) => {
      setText(e_0.target.value);
      setRejected("");
    };
    $[9] = t18;
  } else {
    t18 = $[9];
  }
  let t19;
  if ($[10] !== onBlur || $[11] !== read) {
    t19 = (e_1) => {
      if (!windowBlur(e_1)) {
        read();
      }
      if (onBlur) {
        onBlur(e_1);
      }
    };
    $[10] = onBlur;
    $[11] = read;
    $[12] = t19;
  } else {
    t19 = $[12];
  }
  let t20;
  if ($[13] !== off || $[14] !== onKeyDown || $[15] !== openByHand || $[16] !== read) {
    t20 = (e_2) => {
      if (onKeyDown) {
        onKeyDown(e_2);
      }
      if (e_2.defaultPrevented || isComposing(e_2)) {
        return;
      }
      if (e_2.key === "Enter") {
        read();
      } else {
        if (e_2.key === "ArrowDown" && e_2.altKey && !off) {
          e_2.preventDefault();
          read();
          openByHand();
        }
      }
    };
    $[13] = off;
    $[14] = onKeyDown;
    $[15] = openByHand;
    $[16] = read;
    $[17] = t20;
  } else {
    t20 = $[17];
  }
  let t21;
  if ($[18] !== disabled || $[19] !== mergedRef || $[20] !== readOnly || $[21] !== rest || $[22] !== t13 || $[23] !== t14 || $[24] !== t15 || $[25] !== t16 || $[26] !== t17 || $[27] !== t19 || $[28] !== t20 || $[29] !== text) {
    t21 = /* @__PURE__ */ React.createElement("input", { ...rest, ref: mergedRef, lang: t13, type: "text", inputMode: "numeric", autoComplete: t14, className: "srp-input__field", value: text, disabled, readOnly, placeholder: t15, "aria-invalid": t16, "aria-describedby": t17, onChange: t18, onBlur: t19, onKeyDown: t20 });
    $[18] = disabled;
    $[19] = mergedRef;
    $[20] = readOnly;
    $[21] = rest;
    $[22] = t13;
    $[23] = t14;
    $[24] = t15;
    $[25] = t16;
    $[26] = t17;
    $[27] = t19;
    $[28] = t20;
    $[29] = text;
    $[30] = t21;
  } else {
    t21 = $[30];
  }
  const t22 = buttonLabel || sds.labels.chooseDate;
  const t23 = open ? id : void 0;
  let t24;
  if ($[31] !== close || $[32] !== open || $[33] !== openByHand || $[34] !== read) {
    t24 = () => {
      if (open) {
        close(false, "trigger");
      } else {
        read();
        openByHand();
      }
    };
    $[31] = close;
    $[32] = open;
    $[33] = openByHand;
    $[34] = read;
    $[35] = t24;
  } else {
    t24 = $[35];
  }
  let t25;
  if ($[36] !== off || $[37] !== open || $[38] !== t22 || $[39] !== t23 || $[40] !== t24) {
    t25 = /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions" }, /* @__PURE__ */ React.createElement(InputAction, { ref: button, className: "srp-date-picker__button", icon: icons.CalendarToday, label: t22, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": t23, disabled: off, onClick: t24 }));
    $[36] = off;
    $[37] = open;
    $[38] = t22;
    $[39] = t23;
    $[40] = t24;
    $[41] = t25;
  } else {
    t25 = $[41];
  }
  const t26 = id + "-format";
  let t27;
  if ($[42] !== locale || $[43] !== sds.labels) {
    t27 = sds.labels.formatHint(datePattern(locale));
    $[42] = locale;
    $[43] = sds.labels;
    $[44] = t27;
  } else {
    t27 = $[44];
  }
  let t28;
  if ($[45] !== t26 || $[46] !== t27) {
    t28 = /* @__PURE__ */ React.createElement("span", { id: t26, hidden: true }, t27);
    $[45] = t26;
    $[46] = t27;
    $[47] = t28;
  } else {
    t28 = $[47];
  }
  let t29;
  if ($[48] !== disabled || $[49] !== name || $[50] !== rest || $[51] !== value) {
    t29 = name ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name, form: rest.form, value: value ? isoDate(value) : "", disabled }) : null;
    $[48] = disabled;
    $[49] = name;
    $[50] = rest;
    $[51] = value;
    $[52] = t29;
  } else {
    t29 = $[52];
  }
  const t30 = "dialog";
  const t31 = buttonLabel || sds.labels.chooseDate;
  let t32;
  if ($[53] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t32 = {
      popover: "manual"
    };
    $[53] = t32;
  } else {
    t32 = $[53];
  }
  const t33 = !open || void 0;
  const t34 = !open || void 0;
  const t35 = exit.instant ? "" : void 0;
  const t36 = "srp-date-picker__popup";
  let t37;
  if ($[54] !== close) {
    t37 = (e_3) => {
      if (e_3.key === "Escape" && !isComposing(e_3)) {
        e_3.preventDefault();
        e_3.stopPropagation();
        close(true, "escape");
      }
    };
    $[54] = close;
    $[55] = t37;
  } else {
    t37 = $[55];
  }
  const t38 = open || exit.leaving ? /* @__PURE__ */ React.createElement(Calendar, { value, defaultMonth: (typed && allowed(typed) ? typed : null) || value || void 0, min, max, isDateDisabled, locale, calendar, weekStartsOn, weekNumbers, presets, autoFocus: focusIn, onValueChange: (d_3) => {
    commit(d_3);
    close(true, "select");
  } }) : null;
  let t39;
  if ($[56] !== id || $[57] !== t31 || $[58] !== t32 || $[59] !== t33 || $[60] !== t34 || $[61] !== t35 || $[62] !== t37 || $[63] !== t38) {
    t39 = /* @__PURE__ */ React.createElement("div", { ref: panel, id, role: t30, "aria-label": t31, ...t32, hidden: t33, inert: t34, "data-instant": t35, className: t36, onKeyDown: t37 }, t38);
    $[56] = id;
    $[57] = t31;
    $[58] = t32;
    $[59] = t33;
    $[60] = t34;
    $[61] = t35;
    $[62] = t37;
    $[63] = t38;
    $[64] = t39;
  } else {
    t39 = $[64];
  }
  let t40;
  if ($[65] !== size || $[66] !== style || $[67] !== t11 || $[68] !== t12 || $[69] !== t21 || $[70] !== t25 || $[71] !== t28 || $[72] !== t29 || $[73] !== t39 || $[74] !== t6 || $[75] !== t7 || $[76] !== t8 || $[77] !== t9) {
    t40 = /* @__PURE__ */ React.createElement("span", { ref: box, className: t6, "data-invalid": t7, "data-disabled": t8, "data-readonly": t9, style, "data-component": t10, "data-state": t11, "data-size": size, onMouseDown: t12 }, t21, t25, t28, t29, t39);
    $[65] = size;
    $[66] = style;
    $[67] = t11;
    $[68] = t12;
    $[69] = t21;
    $[70] = t25;
    $[71] = t28;
    $[72] = t29;
    $[73] = t39;
    $[74] = t6;
    $[75] = t7;
    $[76] = t8;
    $[77] = t9;
    $[78] = t40;
  } else {
    t40 = $[78];
  }
  let t41;
  if ($[79] !== id || $[80] !== rejected) {
    t41 = rejected && /* @__PURE__ */ React.createElement("span", { id: id + "-rejected", className: "srp-input-rejected" }, rejected);
    $[79] = id;
    $[80] = rejected;
    $[81] = t41;
  } else {
    t41 = $[81];
  }
  let t42;
  if ($[82] !== t40 || $[83] !== t41) {
    t42 = /* @__PURE__ */ React.createElement(React.Fragment, null, t40, t41);
    $[82] = t40;
    $[83] = t41;
    $[84] = t42;
  } else {
    t42 = $[84];
  }
  return t42;
}
var DatePicker = /* @__PURE__ */ named("DatePicker", DatePickerRender);
export {
  DatePicker
};
//# sourceMappingURL=DatePicker.js.map
