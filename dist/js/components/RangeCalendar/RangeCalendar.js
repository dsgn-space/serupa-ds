"use client";

// src/components/RangeCalendar/RangeCalendar.tsx
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { useAutoFocus } from "../../internal/focus.js";
import { compare, isoDate, sameDay, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { component } from "../../internal/component.js";
import { FieldContext } from "../../internal/field.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Calendar } from "../Calendar/Calendar.js";
import { en as rangeWords } from "./labels.js";
import { en as pickerWords } from "../DateRangePicker/labels.js";
import { useControllable } from "../../internal/controllable.js";
var words = /* @__PURE__ */ Object.assign({}, rangeWords, pickerWords);
var norm = (r) => ({ start: r ? toDay(r.start, "RangeCalendar") : null, end: r ? toDay(r.end, "RangeCalendar") : null });
var order = (a, b) => compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
var between = (d, s, e) => compare(d, s) > 0 && compare(d, e) < 0;
var RangeCalendar = /* @__PURE__ */ component("RangeCalendar", function RangeCalendar2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { weekNumbers: 1, value: 1, defaultValue: 1, onValueChange: 1, months: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, calendar: 1, weekStartsOn: 1, autoFocus: 1, className: 1 });
  const root = React.useRef(null);
  const merged = useMergedRef(ref, (n) => {
    root.current = n;
  });
  useAutoFocus(props.autoFocus, () => root.current && root.current.querySelector('.dk-calendar__day[tabindex="0"]'));
  const locale = useLocale(props.locale);
  const system = calendarOf(props.calendar, "RangeCalendar");
  const [held, setOwn, controlled] = useControllable(props.value, norm(props.defaultValue), "RangeCalendar", "value");
  const value = controlled ? norm(held) : held;
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
    if (props.defaultMonth || value.start) return system.start(props.defaultMonth || value.start);
    const shown2 = typeof document === "undefined" ? null : toDay(document.getElementById(monthsId)?.dataset.month, "RangeCalendar");
    fromServer.current = !!shown2;
    return system.start(shown2 || home());
  });
  const base = props.month ? system.start(props.month) : ownMonth;
  const showMonth = (m) => {
    const s = system.start(m);
    if (!props.month) setOwnMonth(s);
    if (props.onMonthChange) props.onMonthChange(s);
  };
  React.useEffect(() => {
    if (!fromServer.current) return;
    fromServer.current = false;
    const h = home();
    if (!props.month && !system.same(ownMonth, h)) showMonth(h);
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
  const from = shown.start ? shown.start.getTime() : null, to = shown.end ? shown.end.getTime() : null;
  const marks = React.useMemo(() => {
    const s = from === null ? null : new Date(from), e = to === null ? null : new Date(to);
    const inside = (d) => !!s && !!e && between(d, s, e);
    return {
      isEnd: (d) => sameDay(d, s) || sameDay(d, e),
      // The ends join the band between them, so each is square on the band's side (none when they're the same day).
      dayClass: (d) => inside(d) ? "dk-calendar__day--in-range" : s && e && s < e ? sameDay(d, s) ? "dk-calendar__day--range-start" : sameDay(d, e) ? "dk-calendar__day--range-end" : void 0 : void 0,
      dayLabel: (d, name) => {
        if (sameDay(d, s)) return name + ", " + (sameDay(d, e) ? L.startDate + ", " + L.endDate : L.startDate);
        if (sameDay(d, e)) return name + ", " + L.endDate;
        return inside(d) ? name + ", " + L.inRange : name;
      }
    };
  }, [from, to, L]);
  const range = (r) => r.start && r.end ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", calendar: system.id, numberingSystem: "latn" }).formatRange(r.start, r.end).replace(/[\u2009\u202f]/g, " ") : "";
  const status = anchor ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;
  const leave = (first) => (d) => {
    if (!two || !system.same(d, first ? system.add(base, 1) : base)) return false;
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
      onMonthChange: (n) => showMonth(first ? n : system.add(n, -1)),
      value: first ? value.start : value.end,
      min,
      max,
      isDateDisabled: props.isDateDisabled,
      locale,
      calendar: system.id,
      weekStartsOn: props.weekStartsOn,
      weekNumbers: props.weekNumbers,
      hideOutside: two,
      pairedNav: two ? first ? "next" : "previous" : void 0,
      isDateSelected: marks.isEnd,
      dayClassName: marks.dayClass,
      dayLabel: marks.dayLabel,
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
      two ? cal(system.add(base, 1), false) : null
    ),
    /* @__PURE__ */ React.createElement("p", { className: "dk-range-calendar__status", "aria-live": "polite" }, status)
  );
});
export {
  RangeCalendar
};
//# sourceMappingURL=RangeCalendar.js.map
