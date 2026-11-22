"use client";

// src/components/DateRangePicker/DateRangePicker.tsx
import { dateFormat } from "../../internal/intl.js";
import * as React from "react";
import { useControlSize } from "../../internal/controlSize.js";
import { useMergedRef, cn, domId, isInvalid, oneOf, SIZES } from "../../internal/cn.js";
import { compare, datePattern, formatDate, isoDate, parseDate, sameDay, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { reject } from "../../internal/rejectInput.js";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer.js";
import { useExit } from "../../internal/useExit.js";
import { Calendar } from "../Calendar/Calendar.js";
import { Icon } from "../Icon/Icon.js";
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
  const [picking, setPicking] = React.useState("start");
  const [hover, setHover] = React.useState(null);
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
    setPicking("start");
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
    setHover(null);
    if (focus && startField.current) startField.current.focus();
  };
  const show = () => {
    const typed = parseDate(text.start, locale);
    setBase(system.start((typed && allowed(typed) ? typed : null) || value.start || home()));
    setPicking(value.start && !value.end ? "end" : "start");
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
  const rangeText = (a, b) => dateFormat(locale, {
    dateStyle: "medium",
    calendar: system.id,
    numberingSystem: "latn"
  }).formatRange(a, b).replace(/[\u2009\u202f]/g, " ");
  const pick = (d_2) => {
    if (picking === "start" || !value.start || compare(d_2, value.start) < 0) {
      commit({
        start: d_2,
        end: null
      });
      setPicking("end");
      return;
    }
    commit({
      start: value.start,
      end: d_2
    });
    close(true, "select");
  };
  const to = picking === "end" && value.start && !value.end && hover && compare(hover, value.start) > 0 ? hover : value.end;
  const dayClass = (d_3) => {
    const s = value.start;
    if (!s || !to) return void 0;
    if (compare(d_3, s) > 0 && compare(d_3, to) < 0) return "srp-calendar__day--in-range";
    if (compare(s, to) < 0) {
      if (sameDay(d_3, s)) return "srp-calendar__day--range-start";
      if (sameDay(d_3, to)) return "srp-calendar__day--range-end";
    }
    return void 0;
  };
  const isSel = (d_4) => sameDay(d_4, value.start) || sameDay(d_4, value.end);
  const dayLabel = (d_5, name) => {
    const s_0 = value.start, e = to, L = sds.labels;
    if (sameDay(d_5, s_0)) return name + ", " + (sameDay(d_5, e) ? L.startDate + ", " + L.endDate : L.startDate);
    if (sameDay(d_5, e)) return name + ", " + L.endDate;
    return s_0 && e && compare(d_5, s_0) > 0 && compare(d_5, e) < 0 ? name + ", " + L.inRange : name;
  };
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
    setPicking("start");
    setHover(null);
  };
  const field = (which_0) => /* @__PURE__ */ React.createElement("input", { type: "text", inputMode: "numeric", autoComplete: "off", className: "srp-input__field srp-date-range-picker__field", ref: which_0 === "start" ? startField : void 0, id: which_0 === "start" ? id : void 0, "aria-label": which_0 === "start" ? startLabel || sds.labels.startDate : endLabel || sds.labels.endDate, "aria-describedby": cn(describedBy, popId + "-format", rejected && popId + "-rejected"), "aria-errormessage": invalid ? errorMessage : void 0, "aria-required": required, "aria-invalid": invalid || void 0, value: text[which_0], placeholder: datePattern(locale), disabled, readOnly, required: requiredProp, form, onChange: (e_0) => {
    setText({
      ...text,
      [which_0]: e_0.target.value
    });
    setRejected("");
  }, onBlur: (e_1) => {
    if (!windowBlur(e_1)) read(which_0);
  }, onKeyDown: (e_2) => {
    if (isComposing(e_2)) return;
    if (e_2.key === "Enter") read(which_0);
    else if (e_2.key === "ArrowDown" && e_2.altKey && !off) {
      e_2.preventDefault();
      read(which_0);
      show();
    }
  } });
  const leave = (first) => (d_6) => {
    if (!two || !system.same(d_6, first ? system.add(base, 1) : base)) return false;
    const grid = panel.current && panel.current.querySelectorAll('[role="grid"]')[first ? 1 : 0];
    const b_0 = grid && grid.querySelector(`[data-date="${isoDate(d_6)}"]`);
    if (!b_0) return false;
    b_0.focus();
    return b_0.matches(":focus");
  };
  const cal = (m, first_0) => /* @__PURE__ */ React.createElement(Calendar, { month: m, onMonthChange: (n) => setBase(first_0 ? n : system.add(n, -1)), value: first_0 ? value.start : value.end, min, max, isDateDisabled, locale, calendar: system.id, weekStartsOn, weekNumbers, autoFocus: first_0 && focusIn, hideOutside: two, isDateSelected: isSel, dayClassName: dayClass, dayLabel, onDayHover: setHover, onValueChange: pick, onLeaveMonth: leave(first_0) });
  const mergedRef = useMergedRef(ref, (n_0) => {
    box.current = n_0;
    delegateFocus(n_0, start);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { ...rest, ref: mergedRef, role: "group", className: cn("srp-input", "srp-input--size-" + size, "srp-date-range-picker", invalid && "srp-input--invalid", disabled && "srp-input--disabled", readOnly && "srp-input--readonly", className), "data-component": "date-range-picker", "data-state": open ? "open" : "closed", "data-size": size }, field("start"), /* @__PURE__ */ React.createElement("span", { className: "srp-date-range-picker__dash", "aria-hidden": true }, "\u2013"), /* @__PURE__ */ React.createElement("span", { id: popId + "-format", hidden: true }, sds.labels.formatHint(datePattern(locale))), field("end"), /* @__PURE__ */ React.createElement("button", { ref: button, type: "button", className: "srp-date-picker__button srp-date-range-picker__button", "aria-label": buttonLabel || sds.labels.chooseDates, "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? popId : void 0, disabled: off, onClick: () => {
    if (open) close(false, "trigger");
    else {
      read("start");
      show();
    }
  } }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.DateRange })), startName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: startName, form, value: value.start ? isoDate(value.start) : "", disabled }) : null, endName ? /* @__PURE__ */ React.createElement("input", { type: "hidden", name: endName, form, value: value.end ? isoDate(value.end) : "", disabled }) : null, /* @__PURE__ */ React.createElement("div", { ref: panel, id: popId, role: "dialog", "aria-label": buttonLabel || sds.labels.chooseDates, ...{
    popover: "manual"
  }, hidden: !open || void 0, inert: !open || void 0, "data-instant": exit.instant ? "" : void 0, className: "srp-date-picker__popup srp-date-range-picker__popup", onKeyDown: (e_3) => {
    if (e_3.key === "Escape" && !isComposing(e_3)) {
      e_3.preventDefault();
      e_3.stopPropagation();
      close(true, "escape");
    }
  }, onMouseLeave: () => setHover(null) }, open || exit.leaving ? /* @__PURE__ */ React.createElement(React.Fragment, null, presets ? /* @__PURE__ */ React.createElement("div", { className: "srp-date-range-picker__body" }, /* @__PURE__ */ React.createElement("div", { className: "srp-date-range-picker__months" }, cal(base, true), two ? cal(system.add(base, 1), false) : null), /* @__PURE__ */ React.createElement(PresetList, { label: sds.labels.presets, items: presets, allowed, current: value, onPick: choose })) : /* @__PURE__ */ React.createElement("div", { className: "srp-date-range-picker__months" }, cal(base, true), two ? cal(system.add(base, 1), false) : null), /* @__PURE__ */ React.createElement("p", { className: "srp-date-range-picker__status", "aria-live": "polite" }, picking === "end" ? sds.labels.chooseEndDate : value.start && value.end ? sds.labels.rangeSelected(rangeText(value.start, value.end)) : sds.labels.chooseStartDate)) : null)), rejected && /* @__PURE__ */ React.createElement("span", { id: popId + "-rejected", className: "srp-input-rejected" }, rejected));
}
var DateRangePicker = /* @__PURE__ */ named("DateRangePicker", DateRangePickerRender);
export {
  DateRangePicker
};
//# sourceMappingURL=DateRangePicker.js.map
