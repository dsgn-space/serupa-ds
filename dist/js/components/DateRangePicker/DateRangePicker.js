"use client";

// src/components/DateRangePicker/DateRangePicker.tsx
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
function DateRangePickerRender({
  ref,
  ...props
}) {
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
  const describedBy = rest["aria-describedby"], required = rest["aria-required"] ?? (requiredProp || void 0);
  const errorMessage = rest["aria-errormessage"];
  delete rest["aria-describedby"];
  delete rest["aria-required"];
  delete rest["aria-errormessage"];
  const [held, setOwn, controlled] = useControllable(props.value, norm(props.defaultValue), "DateRangePicker", "value");
  const value = controlled ? norm(held) : held;
  const min = toDay(minIn, "DateRangePicker") || void 0, max = toDay(maxIn, "DateRangePicker") || void 0;
  const fmt = (d) => d ? formatDate(d, locale) : "";
  const [text, setText] = React.useState({
    start: fmt(value.start),
    end: fmt(value.end)
  });
  const shown = React.useRef({
    start: key(value.start),
    end: key(value.end)
  });
  const shownLocale = React.useRef(locale);
  if (key(value.start) !== shown.current.start || key(value.end) !== shown.current.end || locale !== shownLocale.current) {
    shown.current = {
      start: key(value.start),
      end: key(value.end)
    };
    shownLocale.current = locale;
    const t = {
      start: fmt(value.start),
      end: fmt(value.end)
    };
    if (t.start !== text.start || t.end !== text.end) setText(t);
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
  const start = () => startField.current;
  useAutoFocus(autoFocus, start);
  useFormReset(startField, () => {
    if (controlled) return;
    const r = norm(props.defaultValue);
    shown.current = {
      start: key(r.start),
      end: key(r.end)
    };
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
    shown.current = {
      start: key(r_0.start),
      end: key(r_0.end)
    };
    setText({
      start: fmt(r_0.start),
      end: fmt(r_0.end)
    });
    if (key(r_0.start) === key(value.start) && key(r_0.end) === key(value.end)) return;
    if (!controlled) setOwn(r_0);
    if (onValueChange) onValueChange(r_0, {
      iso: {
        start: r_0.start ? isoDate(r_0.start) : null,
        end: r_0.end ? isoDate(r_0.end) : null
      }
    });
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
      if (which === "start") r_1.end = null;
      else {
        reject(raw, "unavailable", onInvalidInput, sds.labels.inputNotAccepted, setRejected);
        r_1.end = value.end;
      }
    }
    commit(r_1);
  };
  const close = (focus, reason) => {
    setOpen(false, reason);
    setFocusIn(false);
    if (focus && startField.current) startField.current.focus();
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
  const presets = presetsProp === true ? rangePresets(sds.labels, max) : Array.isArray(presetsProp) && presetsProp.length ? presetsProp.map((p) => {
    const r_2 = norm(typeof p.value === "function" ? p.value() : p.value);
    return {
      label: p.label,
      ...r_2
    };
  }) : null;
  const choose = (it) => {
    commit({
      start: it.start,
      end: it.end
    });
    if (it.start) setBase(system.start(it.start));
  };
  const field = (which_0) => /* @__PURE__ */ React.createElement("input", { type: "text", inputMode: "numeric", autoComplete: "off", className: "srp-input__field srp-date-range-picker__field", ref: which_0 === "start" ? startField : void 0, id: which_0 === "start" ? id : void 0, "aria-label": which_0 === "start" ? startLabel || sds.labels.startDate : endLabel || sds.labels.endDate, "aria-describedby": cn(describedBy, popId + "-format", rejected && popId + "-rejected"), "aria-errormessage": invalid ? errorMessage : void 0, "aria-required": required, "aria-invalid": invalid || void 0, value: text[which_0], placeholder: datePattern(locale), disabled, readOnly, required: requiredProp, form, onChange: (e) => {
    setText({
      ...text,
      [which_0]: e.target.value
    });
    setRejected("");
  }, onBlur: (e_0) => {
    if (!windowBlur(e_0)) read(which_0);
  }, onKeyDown: (e_1) => {
    if (isComposing(e_1)) return;
    if (e_1.key === "Enter") read(which_0);
    else if (e_1.key === "ArrowDown" && e_1.altKey && !off) {
      e_1.preventDefault();
      read(which_0);
      show();
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
  const mergedRef = useMergedRef(ref, (n) => {
    box.current = n;
    delegateFocus(n, start);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { ...rest, ref: mergedRef, role: "group", className: cn("srp-input", "srp-input--size-" + size, "srp-date-range-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className), "data-invalid": invalid ? "" : void 0, "data-disabled": disabled ? "" : void 0, "data-readonly": readOnly ? "" : void 0, "data-component": "date-range-picker", "data-state": open ? "open" : "closed", "data-size": size }, field("start"), /* @__PURE__ */ React.createElement("span", { className: "srp-date-range-picker__dash", "aria-hidden": true }, "\u2013"), /* @__PURE__ */ React.createElement("span", { id: popId + "-format", hidden: true }, sds.labels.formatHint(datePattern(locale))), field("end"), /* @__PURE__ */ React.createElement("span", { className: "srp-input__actions srp-date-range-picker__actions" }, /* @__PURE__ */ React.createElement(InputAction, { ref: button, className: "srp-date-picker__button srp-date-range-picker__button", icon: icons.DateRange, label: buttonLabel || sds.labels.chooseDates, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? popId : void 0, disabled: off, onClick: () => {
    if (open) close(false, "trigger");
    else {
      read("start");
      show();
    }
  } })), startName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: startName, form, value: value.start ? isoDate(value.start) : "", disabled }) : null, endName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: endName, form, value: value.end ? isoDate(value.end) : "", disabled }) : null, /* @__PURE__ */ React.createElement("div", { ref: panel, id: popId, role: "dialog", "aria-label": buttonLabel || sds.labels.chooseDates, ...{
    popover: "manual"
  }, hidden: !open || void 0, inert: !open || void 0, "data-instant": exit.instant ? "" : void 0, className: "srp-date-picker__popup srp-date-range-picker__popup", onKeyDown: (e_2) => {
    if (e_2.key === "Escape" && !isComposing(e_2)) {
      e_2.preventDefault();
      e_2.stopPropagation();
      close(true, "escape");
    }
  } }, open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, presets ? /* @__PURE__ */ React.createElement("div", { className: "srp-date-range-picker__body" }, months, /* @__PURE__ */ React.createElement(PresetList, { label: sds.labels.presets, items: presets, allowed, current: value, onPick: choose })) : months) : null)), rejected && /* @__PURE__ */ React.createElement("span", { id: popId + "-rejected", className: "srp-input-rejected" }, rejected));
}
var DateRangePicker = /* @__PURE__ */ named("DateRangePicker", DateRangePickerRender);
export {
  DateRangePicker
};
//# sourceMappingURL=DateRangePicker.js.map
