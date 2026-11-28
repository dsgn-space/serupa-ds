"use client";

// src/components/DateRangePicker/DateRangePicker.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { useMergedRef, cn, domId, isInvalid, oneOf, SIZES } from "../../internal/cn.js";
import { compare, datePattern, formatDate, isoDate, parseDate, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { reject } from "../../internal/rejectInput.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { RangeCalendar, RangePickContext } from "../RangeCalendar/RangeCalendar.js";
import { InputAction } from "../Input/Input.js";
import { named } from "../../internal/component.js";
import { useFieldControl } from "../../internal/field.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { useFormReset } from "../../internal/useFormReset.js";
import * as icons from "../../material/builtin.js";
import { isComposing } from "../../internal/ime.js";
import { delegateFocus, useAutoFocus, windowBlur } from "../../internal/focus.js";
import { en as DateRangePickerWords } from "./labels.js";
import { en as DatePickerWords } from "../DatePicker/labels.js";
import { en as CalendarWords } from "../Calendar/labels.js";
import { en as RangeCalendarWords } from "../RangeCalendar/labels.js";
import { PresetList, rangePresets } from "../../internal/datePresets.js";
import { useControllable } from "../../internal/controllable.js";
import { useOpenState } from "../../internal/openChange.js";
var words = /* @__PURE__ */ Object.assign({}, DateRangePickerWords, DatePickerWords, /* @__PURE__ */ Object.assign({}, CalendarWords, RangeCalendarWords));
var norm = (r) => ({
  start: r ? toDay(r.start, "DateRangePicker") : null,
  end: r ? toDay(r.end, "DateRangePicker") : null
});
var key = (d) => d ? d.getTime() : null;
function DateRangePickerRender(t0) {
  const $ = _c(67);
  const {
    ref,
    ...t1
  } = t0;
  let props = t1;
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
    disabled,
    readOnly,
    required: requiredProp,
    id,
    startLabel,
    endLabel,
    startName,
    endName,
    form,
    buttonLabel,
    months: _m,
    presets: presetsProp,
    autoFocus,
    className,
    ...rest
  } = props;
  const locale = useLocale(localeProp);
  const system = calendarOf(calendar, "DateRangePicker");
  const size = oneOf(SIZES, useControlSize(props.size), "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const describedBy = rest["aria-describedby"];
  const required = rest["aria-required"] ?? (requiredProp || void 0);
  const errorMessage = rest["aria-errormessage"];
  delete rest["aria-describedby"];
  delete rest["aria-required"];
  delete rest["aria-errormessage"];
  const [held, setOwn, controlled] = useControllable(props.value, norm(props.defaultValue), "DateRangePicker", "value");
  const value = controlled ? norm(held) : held;
  const min = toDay(minIn, "DateRangePicker") || void 0;
  const max = toDay(maxIn, "DateRangePicker") || void 0;
  let t2;
  if ($[0] !== locale) {
    t2 = (d) => d ? formatDate(d, locale) : "";
    $[0] = locale;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const fmt = t2;
  const [text, setText] = React.useState({
    start: fmt(value.start),
    end: fmt(value.end)
  });
  const [seenStart, setSeenStart] = React.useState(key(value.start));
  const [seenEnd, setSeenEnd] = React.useState(key(value.end));
  const [seenLocale, setSeenLocale] = React.useState(locale);
  if (key(value.start) !== seenStart || key(value.end) !== seenEnd || locale !== seenLocale) {
    setSeenStart(key(value.start));
    setSeenEnd(key(value.end));
    setSeenLocale(locale);
    const t = {
      start: fmt(value.start),
      end: fmt(value.end)
    };
    if (t.start !== text.start || t.end !== text.end) {
      setText(t);
    }
  }
  const [open, setOpen] = useOpenState(props.open, props.defaultOpen, onOpenChange, "DateRangePicker", !!disabled || !!readOnly);
  const [focusIn, setFocusIn] = React.useState(false);
  const home = () => {
    const t_0 = /* @__PURE__ */ new Date();
    return min && compare(t_0, min) < 0 ? min : max && compare(t_0, max) > 0 ? max : t_0;
  };
  const [base, setBase] = React.useState(() => system.start(value.start || home()));
  const popId = domId("srp-drp", React.useId());
  const [rejected, setRejected] = React.useState("");
  const box = React.useRef(null);
  const startField = React.useRef(null);
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = () => startField.current;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const start = t3;
  useAutoFocus(autoFocus, start);
  useFormReset(startField, () => {
    if (controlled) {
      return;
    }
    const r = norm(props.defaultValue);
    setSeenStart(key(r.start));
    setSeenEnd(key(r.end));
    setOwn(r);
    setText({
      start: fmt(r.start),
      end: fmt(r.end)
    });
    setOpen(false, "api");
  });
  const button = React.useRef(null);
  const panel = React.useRef(null);
  const two = props.months !== 1;
  const allowed = (d_0) => !(min && compare(d_0, min) < 0) && !(max && compare(d_0, max) > 0) && !(isDateDisabled && isDateDisabled(d_0));
  const commit = (r_0) => {
    setSeenStart(key(r_0.start));
    setSeenEnd(key(r_0.end));
    setText({
      start: fmt(r_0.start),
      end: fmt(r_0.end)
    });
    if (key(r_0.start) === key(value.start) && key(r_0.end) === key(value.end)) {
      return;
    }
    if (!controlled) {
      setOwn(r_0);
    }
    if (onValueChange) {
      onValueChange(r_0, {
        iso: {
          start: r_0.start ? isoDate(r_0.start) : null,
          end: r_0.end ? isoDate(r_0.end) : null
        }
      });
    }
  };
  const read = (which) => {
    const raw = text[which].trim();
    let d_1 = raw === "" ? null : parseDate(raw, locale);
    if (raw !== "" && !(d_1 && allowed(d_1))) {
      reject(raw, d_1 ? "unavailable" : "unreadable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
      d_1 = value[which];
    }
    const r_1 = {
      ...value,
      [which]: d_1
    };
    if (r_1.start && r_1.end && compare(r_1.start, r_1.end) > 0) {
      if (which === "start") {
        r_1.end = null;
      } else {
        reject(raw, "unavailable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
        r_1.end = value.end;
      }
    }
    commit(r_1);
  };
  const close = (focus, reason) => {
    setOpen(false, reason);
    setFocusIn(false);
    if (focus && startField.current) {
      startField.current.focus();
    }
  };
  const show = () => {
    const typed = parseDate(text.start, locale);
    setBase(system.start((typed && allowed(typed) ? typed : null) || value.start || home()));
    setFocusIn(true);
    setOpen(true, "trigger");
  };
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, box, {
    placement: "bottom-start",
    offsetVar: "--srp-drp-offset",
    onOutside: () => close(false, "outside"),
    onFocusOutside: () => close(false, "blur"),
    inside: button
  });
  const off = !!disabled || !!readOnly;
  const presets = presetsProp === true ? rangePresets(sds.labels, max) : Array.isArray(presetsProp) && presetsProp.length ? presetsProp.map(_temp) : null;
  const choose = (it) => {
    commit({
      start: it.start,
      end: it.end
    });
    if (it.start) {
      setBase(system.start(it.start));
    }
  };
  const field = (which_0) => /* @__PURE__ */ React.createElement("input", { type: "text", inputMode: "numeric", autoComplete: "off", className: "srp-input__field srp-date-range-picker__field", ref: which_0 === "start" ? startField : void 0, id: which_0 === "start" ? id : void 0, "aria-label": which_0 === "start" ? startLabel || sds.labels.startDate : endLabel || sds.labels.endDate, "aria-describedby": cn(describedBy, popId + "-format", rejected && popId + "-rejected"), "aria-errormessage": invalid ? errorMessage : void 0, "aria-required": required, "aria-invalid": invalid || void 0, value: text[which_0], placeholder: datePattern(locale), disabled, readOnly, required: requiredProp, form, onChange: (e) => {
    setText({
      ...text,
      [which_0]: e.target.value
    });
    setRejected("");
  }, onBlur: (e_0) => {
    if (!windowBlur(e_0)) {
      read(which_0);
    }
  }, onKeyDown: (e_1) => {
    if (isComposing(e_1)) {
      return;
    }
    if (e_1.key === "Enter") {
      read(which_0);
    } else {
      if (e_1.key === "ArrowDown" && e_1.altKey && !off) {
        e_1.preventDefault();
        read(which_0);
        show();
      }
    }
  } });
  const starts = {
    onStart: (d_2) => {
      commit({
        start: d_2,
        end: null
      });
    }
  };
  const months = /* @__PURE__ */ React.createElement(RangePickContext.Provider, { value: starts }, /* @__PURE__ */ React.createElement(RangeCalendar, { className: "srp-date-range-picker__calendar", "aria-label": buttonLabel || sds.labels.chooseDates, value, months: two ? 2 : 1, month: base, onMonthChange: setBase, min, max, isDateDisabled, locale, calendar: system.id, weekStartsOn, weekNumbers, autoFocus: focusIn, onValueChange: (r_3) => {
    commit(r_3);
    close(true, "select");
  } }));
  let t4;
  if ($[3] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t4 = (n) => {
      box.current = n;
      delegateFocus(n, start);
    };
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const mergedRef = useMergedRef(ref, t4);
  const t5 = "group";
  const t6 = cn("srp-input", "srp-input--size-" + size, "srp-date-range-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className);
  const t7 = invalid ? "" : void 0;
  const t8 = disabled ? "" : void 0;
  const t9 = readOnly ? "" : void 0;
  const t10 = "date-range-picker";
  const t11 = open ? "open" : "closed";
  const t12 = field("start");
  let t13;
  if ($[4] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t13 = /* @__PURE__ */ React.createElement("span", { className: "srp-date-range-picker__dash", "aria-hidden": true }, "\u2013");
    $[4] = t13;
  } else {
    t13 = $[4];
  }
  const t14 = popId + "-format";
  let t15;
  if ($[5] !== locale || $[6] !== sds.labels) {
    t15 = sds.labels.formatHint(datePattern(locale));
    $[5] = locale;
    $[6] = sds.labels;
    $[7] = t15;
  } else {
    t15 = $[7];
  }
  let t16;
  if ($[8] !== t14 || $[9] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("span", { id: t14, hidden: true }, t15);
    $[8] = t14;
    $[9] = t15;
    $[10] = t16;
  } else {
    t16 = $[10];
  }
  const t17 = field("end");
  const t18 = buttonLabel || sds.labels.chooseDates;
  const t19 = open ? popId : void 0;
  let t20;
  if ($[11] !== close || $[12] !== open || $[13] !== read || $[14] !== show) {
    t20 = () => {
      if (open) {
        close(false, "trigger");
      } else {
        read("start");
        show();
      }
    };
    $[11] = close;
    $[12] = open;
    $[13] = read;
    $[14] = show;
    $[15] = t20;
  } else {
    t20 = $[15];
  }
  let t21;
  if ($[16] !== button || $[17] !== off || $[18] !== open || $[19] !== t18 || $[20] !== t19 || $[21] !== t20) {
    t21 = /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions srp-date-range-picker__actions" }, /* @__PURE__ */ React.createElement(InputAction, { ref: button, className: "srp-date-picker__button srp-date-range-picker__button", icon: icons.DateRange, label: t18, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": t19, disabled: off, onClick: t20 }));
    $[16] = button;
    $[17] = off;
    $[18] = open;
    $[19] = t18;
    $[20] = t19;
    $[21] = t20;
    $[22] = t21;
  } else {
    t21 = $[22];
  }
  let t22;
  if ($[23] !== disabled || $[24] !== form || $[25] !== startName || $[26] !== value) {
    t22 = startName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: startName, form, value: value.start ? isoDate(value.start) : "", disabled }) : null;
    $[23] = disabled;
    $[24] = form;
    $[25] = startName;
    $[26] = value;
    $[27] = t22;
  } else {
    t22 = $[27];
  }
  let t23;
  if ($[28] !== disabled || $[29] !== endName || $[30] !== form || $[31] !== value) {
    t23 = endName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: endName, form, value: value.end ? isoDate(value.end) : "", disabled }) : null;
    $[28] = disabled;
    $[29] = endName;
    $[30] = form;
    $[31] = value;
    $[32] = t23;
  } else {
    t23 = $[32];
  }
  const t24 = buttonLabel || sds.labels.chooseDates;
  let t25;
  if ($[33] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t25 = {
      popover: "manual"
    };
    $[33] = t25;
  } else {
    t25 = $[33];
  }
  const t26 = !open || void 0;
  const t27 = !open || void 0;
  const t28 = exit.instant ? "" : void 0;
  let t29;
  if ($[34] !== close) {
    t29 = (e_2) => {
      if (e_2.key === "Escape" && !isComposing(e_2)) {
        e_2.preventDefault();
        e_2.stopPropagation();
        close(true, "escape");
      }
    };
    $[34] = close;
    $[35] = t29;
  } else {
    t29 = $[35];
  }
  const t30 = open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, presets ? /* @__PURE__ */ React.createElement("div", { className: "srp-date-range-picker__body" }, months, /* @__PURE__ */ React.createElement(PresetList, { label: sds.labels.presets, items: presets, allowed, current: value, onPick: choose })) : months) : null;
  let t31;
  if ($[36] !== popId || $[37] !== t24 || $[38] !== t26 || $[39] !== t27 || $[40] !== t28 || $[41] !== t29 || $[42] !== t30) {
    t31 = /* @__PURE__ */ React.createElement("div", { ref: panel, id: popId, role: "dialog", "aria-label": t24, ...t25, hidden: t26, inert: t27, "data-instant": t28, className: "srp-date-picker__popup srp-date-range-picker__popup", onKeyDown: t29 }, t30);
    $[36] = popId;
    $[37] = t24;
    $[38] = t26;
    $[39] = t27;
    $[40] = t28;
    $[41] = t29;
    $[42] = t30;
    $[43] = t31;
  } else {
    t31 = $[43];
  }
  let t32;
  if ($[44] !== mergedRef || $[45] !== rest || $[46] !== size || $[47] !== t11 || $[48] !== t12 || $[49] !== t13 || $[50] !== t16 || $[51] !== t17 || $[52] !== t21 || $[53] !== t22 || $[54] !== t23 || $[55] !== t31 || $[56] !== t6 || $[57] !== t7 || $[58] !== t8 || $[59] !== t9) {
    t32 = /* @__PURE__ */ React.createElement("span", { ...rest, ref: mergedRef, role: t5, className: t6, "data-invalid": t7, "data-disabled": t8, "data-readonly": t9, "data-component": t10, "data-state": t11, "data-size": size }, t12, t13, t16, t17, t21, t22, t23, t31);
    $[44] = mergedRef;
    $[45] = rest;
    $[46] = size;
    $[47] = t11;
    $[48] = t12;
    $[49] = t13;
    $[50] = t16;
    $[51] = t17;
    $[52] = t21;
    $[53] = t22;
    $[54] = t23;
    $[55] = t31;
    $[56] = t6;
    $[57] = t7;
    $[58] = t8;
    $[59] = t9;
    $[60] = t32;
  } else {
    t32 = $[60];
  }
  let t33;
  if ($[61] !== popId || $[62] !== rejected) {
    t33 = rejected && /* @__PURE__ */ React.createElement("span", { id: popId + "-rejected", className: "srp-input-rejected" }, rejected);
    $[61] = popId;
    $[62] = rejected;
    $[63] = t33;
  } else {
    t33 = $[63];
  }
  let t34;
  if ($[64] !== t32 || $[65] !== t33) {
    t34 = /* @__PURE__ */ React.createElement(React.Fragment, null, t32, t33);
    $[64] = t32;
    $[65] = t33;
    $[66] = t34;
  } else {
    t34 = $[66];
  }
  return t34;
}
function _temp(p) {
  const r_2 = norm(typeof p.value === "function" ? p.value() : p.value);
  return {
    label: p.label,
    ...r_2
  };
}
var DateRangePicker = /* @__PURE__ */ named("DateRangePicker", DateRangePickerRender);
export {
  DateRangePicker
};
//# sourceMappingURL=DateRangePicker.js.map
