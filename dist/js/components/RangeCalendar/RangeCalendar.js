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
var norm = (r) => ({
  start: r ? toDay(r.start, "RangeCalendar") : null,
  end: r ? toDay(r.end, "RangeCalendar") : null
});
var order = (a, b) => compare(a, b) <= 0 ? {
  start: a,
  end: b
} : {
  start: b,
  end: a
};
var between = (d, s, e) => compare(d, s) > 0 && compare(d, e) < 0;
function RangeCalendarRender(t0) {
  const $ = _c(93);
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
  let t8;
  if ($[24] !== anchor || $[25] !== controlled || $[26] !== props || $[27] !== setOwn) {
    t8 = (d) => {
      if (!anchor) {
        setAnchor(d);
        setHover(d);
        return;
      }
      const r = order(anchor, d);
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
    $[24] = anchor;
    $[25] = controlled;
    $[26] = props;
    $[27] = setOwn;
    $[28] = t8;
  } else {
    t8 = $[28];
  }
  const pick = t8;
  let t9;
  if ($[29] !== anchor || $[30] !== hover || $[31] !== value) {
    t9 = anchor ? order(anchor, hover || anchor) : value;
    $[29] = anchor;
    $[30] = hover;
    $[31] = value;
    $[32] = t9;
  } else {
    t9 = $[32];
  }
  const shown_0 = t9;
  let t10;
  if ($[33] !== shown_0.start) {
    t10 = shown_0.start ? shown_0.start.getTime() : null;
    $[33] = shown_0.start;
    $[34] = t10;
  } else {
    t10 = $[34];
  }
  const from = t10;
  let t11;
  if ($[35] !== shown_0.end) {
    t11 = shown_0.end ? shown_0.end.getTime() : null;
    $[35] = shown_0.end;
    $[36] = t11;
  } else {
    t11 = $[36];
  }
  const to = t11;
  let t12;
  if ($[37] !== from) {
    t12 = from === null ? null : new Date(from);
    $[37] = from;
    $[38] = t12;
  } else {
    t12 = $[38];
  }
  const s_0 = t12;
  let t13;
  if ($[39] !== to) {
    t13 = to === null ? null : new Date(to);
    $[39] = to;
    $[40] = t13;
  } else {
    t13 = $[40];
  }
  const e = t13;
  let t14;
  if ($[41] !== e || $[42] !== s_0) {
    t14 = (d_0) => !!s_0 && !!e && between(d_0, s_0, e);
    $[41] = e;
    $[42] = s_0;
    $[43] = t14;
  } else {
    t14 = $[43];
  }
  const inside = t14;
  let t15;
  if ($[44] !== e || $[45] !== s_0) {
    t15 = (d_1) => sameDay(d_1, s_0) || sameDay(d_1, e);
    $[44] = e;
    $[45] = s_0;
    $[46] = t15;
  } else {
    t15 = $[46];
  }
  let t16;
  if ($[47] !== e || $[48] !== inside || $[49] !== s_0) {
    t16 = (d_2) => inside(d_2) ? "srp-calendar__day--in-range" : s_0 && e && s_0 < e ? sameDay(d_2, s_0) ? "srp-calendar__day--range-start" : sameDay(d_2, e) ? "srp-calendar__day--range-end" : void 0 : void 0;
    $[47] = e;
    $[48] = inside;
    $[49] = s_0;
    $[50] = t16;
  } else {
    t16 = $[50];
  }
  let t17;
  if ($[51] !== L.endDate || $[52] !== L.inRange || $[53] !== L.startDate || $[54] !== e || $[55] !== inside || $[56] !== s_0) {
    t17 = (d_3, name) => {
      if (sameDay(d_3, s_0)) {
        return name + ", " + (sameDay(d_3, e) ? L.startDate + ", " + L.endDate : L.startDate);
      }
      if (sameDay(d_3, e)) {
        return name + ", " + L.endDate;
      }
      return inside(d_3) ? name + ", " + L.inRange : name;
    };
    $[51] = L.endDate;
    $[52] = L.inRange;
    $[53] = L.startDate;
    $[54] = e;
    $[55] = inside;
    $[56] = s_0;
    $[57] = t17;
  } else {
    t17 = $[57];
  }
  let t18;
  if ($[58] !== t15 || $[59] !== t16 || $[60] !== t17) {
    t18 = {
      isEnd: t15,
      dayClass: t16,
      dayLabel: t17
    };
    $[58] = t15;
    $[59] = t16;
    $[60] = t17;
    $[61] = t18;
  } else {
    t18 = $[61];
  }
  const marks = t18;
  let t19;
  if ($[62] !== locale || $[63] !== system.id) {
    t19 = (r_0) => r_0.start && r_0.end ? dateFormat(locale, {
      dateStyle: "medium",
      calendar: system.id,
      numberingSystem: "latn"
    }).formatRange(r_0.start, r_0.end).replace(/[\u2009\u202f]/g, " ") : "";
    $[62] = locale;
    $[63] = system.id;
    $[64] = t19;
  } else {
    t19 = $[64];
  }
  const range = t19;
  let t20;
  if ($[65] !== L || $[66] !== anchor || $[67] !== range || $[68] !== value) {
    t20 = anchor ? L.chooseEndDate : value.start && value.end ? L.rangeSelected(range(value)) : L.chooseStartDate;
    $[65] = L;
    $[66] = anchor;
    $[67] = range;
    $[68] = value;
    $[69] = t20;
  } else {
    t20 = $[69];
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
  if ($[70] !== props.className || $[71] !== t23) {
    t24 = cn("srp-range-calendar", t23, props.className);
    $[70] = props.className;
    $[71] = t23;
    $[72] = t24;
  } else {
    t24 = $[72];
  }
  const t25 = "range-calendar";
  const t26 = "srp-range-calendar__months";
  const t27 = "presentation";
  const t28 = isoDate(base);
  let t29;
  let t30;
  if ($[73] !== anchor) {
    t29 = (e_0) => {
      if (e_0.key === "Escape" && anchor) {
        e_0.preventDefault();
        e_0.stopPropagation();
        setAnchor(null);
        setHover(null);
      }
    };
    t30 = () => {
      if (anchor) {
        setHover(anchor);
      }
    };
    $[73] = anchor;
    $[74] = t29;
    $[75] = t30;
  } else {
    t29 = $[74];
    t30 = $[75];
  }
  const t31 = cal(base, true);
  const t32 = two ? cal(system.add(base, 1), false) : null;
  let t33;
  if ($[76] !== monthsId || $[77] !== t28 || $[78] !== t29 || $[79] !== t30 || $[80] !== t31 || $[81] !== t32) {
    t33 = /* @__PURE__ */ React.createElement("div", { className: t26, role: t27, id: monthsId, "data-month": t28, onKeyDown: t29, onMouseLeave: t30 }, t31, t32);
    $[76] = monthsId;
    $[77] = t28;
    $[78] = t29;
    $[79] = t30;
    $[80] = t31;
    $[81] = t32;
    $[82] = t33;
  } else {
    t33 = $[82];
  }
  let t34;
  if ($[83] !== status) {
    t34 = /* @__PURE__ */ React.createElement("p", { className: "srp-range-calendar__status", "aria-live": "polite" }, status);
    $[83] = status;
    $[84] = t34;
  } else {
    t34 = $[84];
  }
  let t35;
  if ($[85] !== labelledBy || $[86] !== merged || $[87] !== rest || $[88] !== t22 || $[89] !== t24 || $[90] !== t33 || $[91] !== t34) {
    t35 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: merged, role: t21, "aria-labelledby": labelledBy, "aria-label": t22, className: t24, "data-component": t25 }, t33, t34);
    $[85] = labelledBy;
    $[86] = merged;
    $[87] = rest;
    $[88] = t22;
    $[89] = t24;
    $[90] = t33;
    $[91] = t34;
    $[92] = t35;
  } else {
    t35 = $[92];
  }
  return t35;
}
var RangeCalendar = /* @__PURE__ */ named("RangeCalendar", RangeCalendarRender);
export {
  RangeCalendar
};
//# sourceMappingURL=RangeCalendar.js.map
