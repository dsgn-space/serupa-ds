"use client";

// src/components/RangeCalendar/RangeCalendar.tsx
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { useAutoFocus } from "../../internal/focus.js";
import { addMonths, compare, isoDate, sameDay, sameMonth, startOfMonth, toDay } from "../../internal/dates.js";
import { component } from "../../internal/component.js";
import { FieldContext } from "../../internal/field.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Calendar } from "../Calendar/Calendar.js";
import { en as rangeWords } from "./labels.js";
import { en as pickerWords } from "../DateRangePicker/labels.js";
var words = /* @__PURE__ */ Object.assign({}, rangeWords, pickerWords);
var norm = (r) => ({ start: r ? toDay(r.start, "RangeCalendar") : null, end: r ? toDay(r.end, "RangeCalendar") : null });
var order = (a, b) => compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
var between = (d, s, e) => compare(d, s) > 0 && compare(d, e) < 0;
var RangeCalendar = /* @__PURE__ */ component("RangeCalendar", function RangeCalendar2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { value: 1, defaultValue: 1, onValueChange: 1, months: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, weekStartsOn: 1, autoFocus: 1, className: 1 });
  const root = React.useRef(null);
  const merged = useMergedRef(ref, (n) => {
    root.current = n;
  });
  useAutoFocus(props.autoFocus, () => root.current && root.current.querySelector('.dk-calendar__day[tabindex="0"]'));
  const locale = useLocale(props.locale);
  const controlled = props.value !== void 0;
  const [own, setOwn] = React.useState(() => norm(props.defaultValue));
  const value = controlled ? norm(props.value) : own;
  const min = toDay(props.min, "RangeCalendar") || void 0, max = toDay(props.max, "RangeCalendar") || void 0;
  const [anchor, setAnchor] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const home = () => {
    const t = /* @__PURE__ */ new Date();
    return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t;
  };
  const monthsId = domId("dk-range-calendar", React.useId()) + "-months";
  const fromServer = React.useRef(false);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    if (props.defaultMonth || value.start) return startOfMonth(props.defaultMonth || value.start);
    const shown2 = typeof document === "undefined" ? null : toDay(document.getElementById(monthsId)?.dataset.month, "RangeCalendar");
    fromServer.current = !!shown2;
    return startOfMonth(shown2 || home());
  });
  const base = props.month ? startOfMonth(props.month) : ownMonth;
  const showMonth = (m) => {
    const s = startOfMonth(m);
    if (!props.month) setOwnMonth(s);
    if (props.onMonthChange) props.onMonthChange(s);
  };
  React.useEffect(() => {
    if (!fromServer.current) return;
    fromServer.current = false;
    const h = home();
    if (!props.month && !sameMonth(ownMonth, h)) showMonth(h);
  });
  const two = props.months === 2;
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const labelledBy = rest["aria-labelledby"] ?? (rest["aria-label"] ? void 0 : fieldLabel);
  const pick = (d) => {
    if (!anchor) {
      setAnchor(d);
      setHover(d);
      return;
    }
    const r = order(anchor, d);
    setAnchor(null);
    if (!controlled) setOwn(r);
    if (props.onValueChange) props.onValueChange(r, { start: isoDate(r.start), end: isoDate(r.end) });
  };
  const shown = anchor ? order(anchor, hover || anchor) : value;
  const isEnd = (d) => sameDay(d, shown.start) || sameDay(d, shown.end);
  const inside = (d) => !!shown.start && !!shown.end && between(d, shown.start, shown.end);
  const dayClass = (d) => inside(d) ? "dk-calendar__day--in-range" : void 0;
  const dayLabel = (d, name) => {
    if (sameDay(d, shown.start)) return name + ", " + (sameDay(d, shown.end) ? L.startDate + ", " + L.endDate : L.startDate);
    if (sameDay(d, shown.end)) return name + ", " + L.endDate;
    return inside(d) ? name + ", " + L.inRange : name;
  };
  const range = (r) => r.start && r.end ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", calendar: "gregory", numberingSystem: "latn" }).formatRange(r.start, r.end).replace(/[\u2009\u202f]/g, " ") : "";
  const status = anchor ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;
  const leave = (first) => (d) => {
    if (!two || !sameMonth(d, first ? addMonths(base, 1) : base)) return false;
    const grid = root.current && root.current.querySelectorAll('[role="grid"]')[first ? 1 : 0];
    const b = grid && grid.querySelector(`[data-date="${isoDate(d)}"]`);
    if (!b) return false;
    b.focus();
    return b.matches(":focus");
  };
  const cal = (m, first) => /* @__PURE__ */ React.createElement(
    Calendar,
    {
      month: m,
      onMonthChange: (n) => showMonth(first ? n : addMonths(n, -1)),
      value: first ? value.start : value.end,
      min,
      max,
      isDateDisabled: props.isDateDisabled,
      locale,
      weekStartsOn: props.weekStartsOn,
      hideOutside: two,
      pairedNav: two ? first ? "next" : "previous" : void 0,
      isDateSelected: isEnd,
      dayClassName: dayClass,
      dayLabel,
      onDayHover: setHover,
      onValueChange: pick,
      onLeaveMonth: leave(first)
    }
  );
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref: merged,
      role: "group",
      "aria-labelledby": labelledBy,
      "aria-label": labelledBy ? void 0 : rest["aria-label"] || L.chooseDates,
      className: cn("dk-range-calendar", two && "dk-range-calendar--two", props.className),
      "data-component": "range-calendar"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "dk-range-calendar__months",
        role: "presentation",
        id: monthsId,
        "data-month": isoDate(base),
        onKeyDown: (e) => {
          if (e.key === "Escape" && anchor) {
            e.preventDefault();
            e.stopPropagation();
            setAnchor(null);
            setHover(null);
          }
        },
        onMouseLeave: () => {
          if (anchor) setHover(anchor);
        }
      },
      cal(base, true),
      two ? cal(addMonths(base, 1), false) : null
    ),
    /* @__PURE__ */ React.createElement("p", { className: "dk-range-calendar__status", "aria-live": "polite" }, status)
  );
});
export {
  RangeCalendar
};
//# sourceMappingURL=RangeCalendar.js.map
