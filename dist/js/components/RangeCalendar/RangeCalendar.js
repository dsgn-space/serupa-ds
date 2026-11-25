"use client";

// src/components/RangeCalendar/RangeCalendar.tsx
import { c as _c } from "../../internal/memoCache.js";
import { dateFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { useAutoFocus } from "../../internal/focus.js";
import { compare, isoDate, sameDay, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { named } from "../../internal/component.js";
import { FieldContext } from "../../internal/field.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Calendar } from "../Calendar/Calendar.js";
import { en as rangeWords } from "./labels.js";
import { en as pickerWords } from "../DateRangePicker/labels.js";
import { useControllable } from "../../internal/controllable.js";
var words = /* @__PURE__ */ Object.assign({}, rangeWords, pickerWords);
var RangePickContext = /* @__PURE__ */ React.createContext(null);
var norm = (r) => ({
  start: r ? toDay(r.start, "RangeCalendar") : null,
  end: r ? toDay(r.end, "RangeCalendar") : null
});
var between = (d, s, e) => compare(d, s) > 0 && compare(d, e) < 0;
function RangeCalendarRender(t0) {
  const $ = _c(96);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    headingLevel: 1,
    weekNumbers: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    months: 1,
    month: 1,
    defaultMonth: 1,
    onMonthChange: 1,
    min: 1,
    max: 1,
    isDateDisabled: 1,
    locale: 1,
    calendar: 1,
    weekStartsOn: 1,
    autoFocus: 1,
    className: 1
  });
  const root = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n) => {
      root.current = n;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const merged = useMergedRef(ref, t1);
  let t2;
  if ($[1] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => root.current && root.current.querySelector('.srp-calendar__day[tabindex="0"]');
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  useAutoFocus(props.autoFocus, t2);
  const locale = useLocale(props.locale);
  const system = calendarOf(props.calendar, "RangeCalendar");
  const [held, setOwn, controlled] = useControllable(props.value, norm(props.defaultValue), "RangeCalendar", "value");
  let t3;
  if ($[2] !== controlled || $[3] !== held) {
    t3 = controlled ? norm(held) : held;
    $[2] = controlled;
    $[3] = held;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  const value = t3;
  const min = toDay(props.min, "RangeCalendar") || void 0;
  const max = toDay(props.max, "RangeCalendar") || void 0;
  const [anchor, setAnchor] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  let t4;
  if ($[5] !== max || $[6] !== min) {
    t4 = () => {
      const t = /* @__PURE__ */ new Date();
      return min && compare(t, min) < 0 ? min : max && compare(t, max) > 0 ? max : t;
    };
    $[5] = max;
    $[6] = min;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  const home = t4;
  const monthsId = domId("srp-range-calendar", React.useId()) + "-months";
  let t5;
  if ($[8] !== home || $[9] !== monthsId || $[10] !== props.defaultMonth || $[11] !== system || $[12] !== value.start) {
    t5 = () => {
      if (props.defaultMonth || value.start) {
        return {
          month: system.start(props.defaultMonth || value.start),
          fromServer: false
        };
      }
      const shown = typeof document === "undefined" ? null : toDay(document.getElementById(monthsId)?.dataset.month, "RangeCalendar");
      return {
        month: system.start(shown || home()),
        fromServer: !!shown
      };
    };
    $[8] = home;
    $[9] = monthsId;
    $[10] = props.defaultMonth;
    $[11] = system;
    $[12] = value.start;
    $[13] = t5;
  } else {
    t5 = $[13];
  }
  const [first] = React.useState(t5);
  const [ownMonth, setOwnMonth] = React.useState(first.month);
  const movedRef = React.useRef(false);
  const base = props.month ? system.start(props.month) : ownMonth;
  let t6;
  if ($[14] !== props || $[15] !== system) {
    t6 = (m) => {
      const s = system.start(m);
      if (!props.month) {
        setOwnMonth(s);
      }
      if (props.onMonthChange) {
        props.onMonthChange(s);
      }
    };
    $[14] = props;
    $[15] = system;
    $[16] = t6;
  } else {
    t6 = $[16];
  }
  const showMonth = t6;
  let t7;
  if ($[17] !== first.fromServer || $[18] !== home || $[19] !== ownMonth || $[20] !== props.month || $[21] !== showMonth || $[22] !== system) {
    t7 = () => {
      if (!first.fromServer || movedRef.current) {
        return;
      }
      movedRef.current = true;
      const h = home();
      if (!props.month && !system.same(ownMonth, h)) {
        showMonth(h);
      }
    };
    $[17] = first.fromServer;
    $[18] = home;
    $[19] = ownMonth;
    $[20] = props.month;
    $[21] = showMonth;
    $[22] = system;
    $[23] = t7;
  } else {
    t7 = $[23];
  }
  React.useEffect(t7);
  const two = props.months === 2;
  const fieldLabel = React.useContext(FieldContext)?.labelId;
  const labelledBy = rest["aria-labelledby"] ?? (rest["aria-label"] ? void 0 : fieldLabel);
  const inPicker = React.useContext(RangePickContext);
  const open = anchor || (value.start && !value.end ? value.start : null);
  let t8;
  if ($[24] !== controlled || $[25] !== inPicker || $[26] !== open || $[27] !== props || $[28] !== setOwn) {
    t8 = (d) => {
      if (!open || compare(d, open) < 0) {
        setAnchor(d);
        setHover(null);
        if (inPicker) {
          inPicker.onStart(d);
        }
        return;
      }
      const r = {
        start: open,
        end: d
      };
      setAnchor(null);
      if (!controlled) {
        setOwn(r);
      }
      if (props.onValueChange) {
        props.onValueChange(r, {
          iso: {
            start: isoDate(r.start),
            end: isoDate(r.end)
          }
        });
      }
    };
    $[24] = controlled;
    $[25] = inPicker;
    $[26] = open;
    $[27] = props;
    $[28] = setOwn;
    $[29] = t8;
  } else {
    t8 = $[29];
  }
  const pick = t8;
  let t9;
  if ($[30] !== hover || $[31] !== open || $[32] !== value) {
    t9 = open ? {
      start: open,
      end: hover && compare(hover, open) > 0 ? hover : null
    } : value;
    $[30] = hover;
    $[31] = open;
    $[32] = value;
    $[33] = t9;
  } else {
    t9 = $[33];
  }
  const shown_0 = t9;
  let t10;
  if ($[34] !== shown_0.start) {
    t10 = shown_0.start ? shown_0.start.getTime() : null;
    $[34] = shown_0.start;
    $[35] = t10;
  } else {
    t10 = $[35];
  }
  const from = t10;
  let t11;
  if ($[36] !== shown_0.end) {
    t11 = shown_0.end ? shown_0.end.getTime() : null;
    $[36] = shown_0.end;
    $[37] = t11;
  } else {
    t11 = $[37];
  }
  const to = t11;
  let t12;
  if ($[38] !== from) {
    t12 = from === null ? null : new Date(from);
    $[38] = from;
    $[39] = t12;
  } else {
    t12 = $[39];
  }
  const s_0 = t12;
  let t13;
  if ($[40] !== to) {
    t13 = to === null ? null : new Date(to);
    $[40] = to;
    $[41] = t13;
  } else {
    t13 = $[41];
  }
  const e = t13;
  let t14;
  if ($[42] !== e || $[43] !== s_0) {
    t14 = (d_0) => !!s_0 && !!e && between(d_0, s_0, e);
    $[42] = e;
    $[43] = s_0;
    $[44] = t14;
  } else {
    t14 = $[44];
  }
  const inside = t14;
  let t15;
  if ($[45] !== e || $[46] !== s_0) {
    t15 = (d_1) => sameDay(d_1, s_0) || sameDay(d_1, e);
    $[45] = e;
    $[46] = s_0;
    $[47] = t15;
  } else {
    t15 = $[47];
  }
  let t16;
  if ($[48] !== e || $[49] !== inside || $[50] !== s_0) {
    t16 = (d_2) => inside(d_2) ? "srp-calendar__day--in-range" : s_0 && e && s_0 < e ? sameDay(d_2, s_0) ? "srp-calendar__day--range-start" : sameDay(d_2, e) ? "srp-calendar__day--range-end" : void 0 : void 0;
    $[48] = e;
    $[49] = inside;
    $[50] = s_0;
    $[51] = t16;
  } else {
    t16 = $[51];
  }
  let t17;
  if ($[52] !== L.endDate || $[53] !== L.inRange || $[54] !== L.startDate || $[55] !== e || $[56] !== inside || $[57] !== s_0) {
    t17 = (d_3, name) => {
      if (sameDay(d_3, s_0)) {
        return name + ", " + (sameDay(d_3, e) ? L.startDate + ", " + L.endDate : L.startDate);
      }
      if (sameDay(d_3, e)) {
        return name + ", " + L.endDate;
      }
      return inside(d_3) ? name + ", " + L.inRange : name;
    };
    $[52] = L.endDate;
    $[53] = L.inRange;
    $[54] = L.startDate;
    $[55] = e;
    $[56] = inside;
    $[57] = s_0;
    $[58] = t17;
  } else {
    t17 = $[58];
  }
  let t18;
  if ($[59] !== t15 || $[60] !== t16 || $[61] !== t17) {
    t18 = {
      isEnd: t15,
      dayClass: t16,
      dayLabel: t17
    };
    $[59] = t15;
    $[60] = t16;
    $[61] = t17;
    $[62] = t18;
  } else {
    t18 = $[62];
  }
  const marks = t18;
  let t19;
  if ($[63] !== locale || $[64] !== system.id) {
    t19 = (r_0) => r_0.start && r_0.end ? dateFormat(locale, {
      dateStyle: "medium",
      calendar: system.id,
      numberingSystem: "latn"
    }).formatRange(r_0.start, r_0.end).replace(/[\u2009\u202f]/g, " ") : "";
    $[63] = locale;
    $[64] = system.id;
    $[65] = t19;
  } else {
    t19 = $[65];
  }
  const range = t19;
  let t20;
  if ($[66] !== L || $[67] !== open || $[68] !== range || $[69] !== value) {
    t20 = open ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;
    $[66] = L;
    $[67] = open;
    $[68] = range;
    $[69] = value;
    $[70] = t20;
  } else {
    t20 = $[70];
  }
  const status = t20;
  const leave = (first_0) => (d_4) => {
    if (!two || !system.same(d_4, first_0 ? system.add(base, 1) : base)) {
      return false;
    }
    const grid = root.current && root.current.querySelectorAll('[role="grid"]')[first_0 ? 1 : 0];
    const b = grid && grid.querySelector(`[data-date="${isoDate(d_4)}"]`);
    if (!b) {
      return false;
    }
    b.focus();
    return b.matches(":focus");
  };
  const cal = (m_0, first_1) => /* @__PURE__ */ React.createElement(Calendar, { month: m_0, onMonthChange: (n_0) => showMonth(first_1 ? n_0 : system.add(n_0, -1)), value: first_1 ? value.start : value.end, min, max, isDateDisabled: props.isDateDisabled, locale, calendar: system.id, weekStartsOn: props.weekStartsOn, weekNumbers: props.weekNumbers, headingLevel: props.headingLevel, hideOutside: two, pairedNav: two ? first_1 ? "next" : "previous" : void 0, isDateSelected: marks.isEnd, dayClassName: marks.dayClass, dayLabel: marks.dayLabel, onDayHover: setHover, onValueChange: pick, onLeaveMonth: leave(first_1) });
  const t21 = "group";
  const t22 = labelledBy ? void 0 : rest["aria-label"] || L.chooseDates;
  const t23 = two && "srp-range-calendar--two";
  let t24;
  if ($[71] !== props.className || $[72] !== t23) {
    t24 = cn("srp-range-calendar", t23, props.className);
    $[71] = props.className;
    $[72] = t23;
    $[73] = t24;
  } else {
    t24 = $[73];
  }
  const t25 = "range-calendar";
  const t26 = "srp-range-calendar__months";
  const t27 = "presentation";
  const t28 = isoDate(base);
  let t29;
  if ($[74] !== anchor || $[75] !== inPicker) {
    t29 = (e_0) => {
      if (e_0.key === "Escape" && anchor && !inPicker) {
        e_0.preventDefault();
        e_0.stopPropagation();
        setAnchor(null);
        setHover(null);
      }
    };
    $[74] = anchor;
    $[75] = inPicker;
    $[76] = t29;
  } else {
    t29 = $[76];
  }
  let t30;
  if ($[77] !== open) {
    t30 = () => {
      if (open) {
        setHover(null);
      }
    };
    $[77] = open;
    $[78] = t30;
  } else {
    t30 = $[78];
  }
  const t31 = cal(base, true);
  const t32 = two ? cal(system.add(base, 1), false) : null;
  let t33;
  if ($[79] !== monthsId || $[80] !== t28 || $[81] !== t29 || $[82] !== t30 || $[83] !== t31 || $[84] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("div", { className: t26, role: t27, id: monthsId, "data-month": t28, onKeyDown: t29, onMouseLeave: t30 }, t31, t32);
    $[79] = monthsId;
    $[80] = t28;
    $[81] = t29;
    $[82] = t30;
    $[83] = t31;
    $[84] = t32;
    $[85] = t33;
  } else {
    t33 = $[85];
  }
  let t34;
  if ($[86] !== status) {
    t34 = /* @__PURE__ */ React.createElement("p", { className: "srp-range-calendar__status", "aria-live": "polite" }, status);
    $[86] = status;
    $[87] = t34;
  } else {
    t34 = $[87];
  }
  let t35;
  if ($[88] !== labelledBy || $[89] !== merged || $[90] !== rest || $[91] !== t22 || $[92] !== t24 || $[93] !== t33 || $[94] !== t34) {
    t35 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: merged, role: t21, "aria-labelledby": labelledBy, "aria-label": t22, className: t24, "data-component": t25 }, t33, t34);
    $[88] = labelledBy;
    $[89] = merged;
    $[90] = rest;
    $[91] = t22;
    $[92] = t24;
    $[93] = t33;
    $[94] = t34;
    $[95] = t35;
  } else {
    t35 = $[95];
  }
  return t35;
}
var RangeCalendar = /* @__PURE__ */ named("RangeCalendar", RangeCalendarRender);
export {
  RangeCalendar,
  RangePickContext
};
//# sourceMappingURL=RangeCalendar.js.map
