"use client";

// src/components/Calendar/Calendar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, omit, useLatest } from "../../internal/cn.js";
import { addDays, compare, day, firstDayOfWeek, isoDate, isValid, sameDay, startOfWeek, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { named } from "../../internal/component.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { useFocusHandover } from "../../internal/focus.js";
import { dayPresets, PresetList } from "../../internal/datePresets.js";
import { en as calendarWords } from "./labels.js";
import { en as periodWords } from "../PeriodPicker/labels.js";
import { isComposing } from "../../internal/ime.js";
import { dayCell, gridKey, periodCell } from "../../internal/gridKeys.js";
var words = /* @__PURE__ */ Object.assign({}, calendarWords, periodWords);
var FORMATS = /* @__PURE__ */ new Map();
function header(locale) {
  const fmt = (o, at = locale) => new Intl.DateTimeFormat(at, o);
  const short = fmt({
    weekday: "short"
  }), long = fmt({
    weekday: "long"
  }), narrow = fmt({
    weekday: "narrow"
  });
  const week = Array.from({
    length: 7
  }, (_, i) => new Date(2025, 2, 2 + i));
  const names = (f) => week.map((d) => f.format(d)).join("|");
  const wide = week.some((d) => short.format(d) === long.format(d) || /\s/.test(short.format(d))) || names(short).length > 7 * 5 - 1;
  const english = names(narrow) === names(fmt({
    weekday: "narrow"
  }, "en")) && names(short) !== names(fmt({
    weekday: "short"
  }, "en"));
  return wide && !english ? narrow : short;
}
function formats(locale, cal) {
  let f = FORMATS.get(locale + " " + cal.id);
  if (!f) {
    const greg = {
      calendar: cal.id,
      numberingSystem: "latn"
    };
    f = {
      title: new Intl.DateTimeFormat(locale, {
        ...greg,
        month: "long",
        year: "numeric"
      }),
      short: header(locale),
      long: new Intl.DateTimeFormat(locale, {
        weekday: "long"
      }),
      full: new Intl.DateTimeFormat(locale, {
        ...greg,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      month: new Intl.DateTimeFormat(locale, {
        ...greg,
        month: "long"
      }),
      monthShort: new Intl.DateTimeFormat(locale, {
        ...greg,
        month: "short"
      }),
      year: new Intl.DateTimeFormat(locale, {
        ...greg,
        year: "numeric"
      })
    };
    FORMATS.set(locale + " " + cal.id, f);
  }
  return f;
}
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t.getTime() - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
var Weeks = /* @__PURE__ */ React.memo(function Weeks2(p) {
  const month = new Date(p.month), first = startOfWeek(month, p.ws), full = formats(p.locale, p.cal).full;
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let i = 0; i < 7; i++) row.push(addDays(first, w * 7 + i));
    weeks.push(row);
  }
  const disabled = (d) => p.min !== null && d.getTime() < p.min || p.max !== null && d.getTime() > p.max || (p.isDateDisabled ? p.isDateDisabled(d) : false);
  return weeks.map((row, w) => /* @__PURE__ */ React.createElement("tr", { key: w }, p.week != null ? /* @__PURE__ */ React.createElement("th", { scope: "row", className: "srp-calendar__week" }, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, p.week + " "), isoWeek(row.find((d) => d.getDay() === 4) || row[0])) : null, row.map((d) => {
    const t = d.getTime(), off = !!disabled(d), sel = p.isDateSelected ? p.isDateSelected(d) : t === p.value, outside = !p.cal.same(d, month), now = t === p.marked;
    if (outside && p.hideOutside) return /* @__PURE__ */ React.createElement("td", { key: t, role: "gridcell", className: "srp-calendar__blank" });
    return /* @__PURE__ */ React.createElement("td", { key: t, "aria-selected": sel, role: "gridcell" }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: t === p.stop ? 0 : -1, "aria-label": p.dayLabel ? p.dayLabel(d, full.format(d)) : full.format(d), "aria-disabled": off || void 0, "aria-current": now ? "date" : void 0, className: cn("srp-calendar__day", outside && "srp-calendar__day--outside", sel && "srp-calendar__day--selected", now && "srp-calendar__day--today", off && "srp-calendar__day--disabled", p.dayClassName && p.dayClassName(d)), "data-outside": outside ? "" : void 0, "data-selected": sel ? "" : void 0, "data-today": now ? "" : void 0, "data-disabled": off ? "" : void 0, "data-date": d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"), onClick: () => p.on.pick(d), onFocus: () => p.on.focus(d), onMouseEnter: p.hover ? () => p.on.hover(d) : void 0 }, p.cal.date(d)));
  })));
});
var OWN = {
  headingLevel: 1,
  weekNumbers: 1,
  value: 1,
  defaultValue: 1,
  onValueChange: 1,
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
  previousLabel: 1,
  nextLabel: 1,
  monthYearPicker: 1,
  presets: 1,
  dayClassName: 1,
  isDateSelected: 1,
  onDayHover: 1,
  hideOutside: 1,
  dayLabel: 1,
  pairedNav: 1,
  onLeaveMonth: 1,
  className: 1
};
var never = () => () => {
};
var yes = () => true;
var no = () => false;
function CalendarRender(t0) {
  const $ = _c(100);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const H = "h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel) < 0 ? 2 : props.headingLevel);
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const cal = calendarOf(props.calendar, "Calendar");
  const ws = Number.isFinite(props.weekStartsOn) ? (Math.floor(props.weekStartsOn) % 7 + 7) % 7 : firstDayOfWeek(locale);
  const controlledValue = props.value !== void 0;
  let t1;
  if ($[0] !== props.defaultValue) {
    t1 = () => toDay(props.defaultValue, "Calendar");
    $[0] = props.defaultValue;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const [ownValue, setOwnValue] = React.useState(t1);
  let t2;
  if ($[2] !== controlledValue || $[3] !== ownValue || $[4] !== props.value) {
    t2 = controlledValue ? toDay(props.value, "Calendar") : ownValue;
    $[2] = controlledValue;
    $[3] = ownValue;
    $[4] = props.value;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const value = t2;
  const min = toDay(props.min, "Calendar");
  const max = toDay(props.max, "Calendar");
  const [, setTick] = React.useState(0);
  const today = day(/* @__PURE__ */ new Date());
  const todayTime = today.getTime();
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const marked = hydrated ? today : null;
  React.useEffect(() => {
    const t = setTimeout(() => setTick(_temp), addDays(new Date(todayTime), 1).getTime() - Date.now() + 50);
    return () => clearTimeout(t);
  }, [todayTime]);
  const home = min && compare(today, min) < 0 ? min : max && compare(today, max) > 0 ? max : today;
  const controlledMonth = props.month !== void 0;
  const titleId = domId("srp-cal", React.useId()) + "-title";
  let t3;
  if ($[6] !== cal || $[7] !== controlledMonth || $[8] !== home || $[9] !== props.defaultMonth || $[10] !== titleId || $[11] !== value) {
    t3 = () => {
      const given = props.defaultMonth || value;
      const server = given || controlledMonth ? null : serverMonth(titleId);
      return {
        drawn: server ? server.getTime() : null,
        month: cal.start(given || server || home)
      };
    };
    $[6] = cal;
    $[7] = controlledMonth;
    $[8] = home;
    $[9] = props.defaultMonth;
    $[10] = titleId;
    $[11] = value;
    $[12] = t3;
  } else {
    t3 = $[12];
  }
  const [opening] = React.useState(t3);
  const drawn = React.useRef(opening.drawn);
  const [ownMonth, setOwnMonth] = React.useState(opening.month);
  let t4;
  if ($[13] !== cal || $[14] !== home) {
    t4 = cal.start(home).getTime();
    $[13] = cal;
    $[14] = home;
    $[15] = t4;
  } else {
    t4 = $[15];
  }
  const homeMonth = t4;
  const onMonthChange = props.onMonthChange;
  let t5;
  let t6;
  if ($[16] !== homeMonth || $[17] !== onMonthChange || $[18] !== ownMonth) {
    t5 = () => {
      const was = drawn.current;
      drawn.current = null;
      if (was == null || was === homeMonth || ownMonth.getTime() !== was) {
        return;
      }
      setOwnMonth(new Date(homeMonth));
      if (onMonthChange) {
        onMonthChange(new Date(homeMonth));
      }
    };
    t6 = [homeMonth, ownMonth, onMonthChange];
    $[16] = homeMonth;
    $[17] = onMonthChange;
    $[18] = ownMonth;
    $[19] = t5;
    $[20] = t6;
  } else {
    t5 = $[19];
    t6 = $[20];
  }
  React.useEffect(t5, t6);
  const month = controlledMonth && isValid(props.month) ? cal.start(props.month) : ownMonth;
  const [focus, setFocus] = React.useState(() => value && cal.same(value, month) ? value : cal.same(home, month) ? home : month);
  let t7;
  if ($[21] !== value) {
    t7 = value ? value.getTime() : null;
    $[21] = value;
    $[22] = t7;
  } else {
    t7 = $[22];
  }
  const valueTime = t7;
  const [seen, setSeen] = React.useState(valueTime);
  if (seen !== valueTime) {
    setSeen(valueTime);
    const away = !!value && !cal.same(value, month);
    if (value && !(away && controlledMonth)) {
      setFocus(value);
      if (away) {
        setOwnMonth(cal.start(value));
      }
    }
  }
  const grid = React.useRef(null);
  const wantFocus = React.useRef(!!props.autoFocus);
  const drill = !props.monthYearPicker && !props.pairedNav && !props.hideOutside;
  const [view, setView] = React.useState("days");
  const [pFocus, setPFocus] = React.useState(0);
  const periods = React.useRef(null);
  const heading = React.useRef(null);
  const wantPeriod = React.useRef(null);
  const inYear = React.useRef(0);
  let t8;
  if ($[23] !== max || $[24] !== min || $[25] !== props) {
    t8 = (d) => min && compare(d, min) < 0 || max && compare(d, max) > 0 || (props.isDateDisabled ? props.isDateDisabled(d) : false);
    $[23] = max;
    $[24] = min;
    $[25] = props;
    $[26] = t8;
  } else {
    t8 = $[26];
  }
  const disabled = t8;
  let t9;
  if ($[27] !== cal || $[28] !== controlledMonth || $[29] !== props) {
    t9 = (m) => {
      const s = cal.start(m);
      if (!controlledMonth) {
        setOwnMonth(s);
      }
      if (props.onMonthChange) {
        props.onMonthChange(s);
      }
    };
    $[27] = cal;
    $[28] = controlledMonth;
    $[29] = props;
    $[30] = t9;
  } else {
    t9 = $[30];
  }
  const showMonth = t9;
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (!cal.same(focus, month)) {
      setFocus(value && cal.same(value, month) ? value : cal.same(home, month) ? home : month);
    }
  }
  let t10;
  if ($[31] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t10 = () => {
      if (!wantFocus.current || !grid.current) {
        return;
      }
      wantFocus.current = false;
      const b = grid.current.querySelector('button[tabindex="0"]');
      if (b) {
        b.focus();
      }
    };
    $[31] = t10;
  } else {
    t10 = $[31];
  }
  React.useEffect(t10);
  const move = (d_0) => {
    if (!cal.same(d_0, month) && props.onLeaveMonth && props.onLeaveMonth(d_0)) {
      return;
    }
    setFocus(d_0);
    if (!cal.same(d_0, month)) {
      showMonth(d_0);
    }
    wantFocus.current = true;
  };
  const pick = (d_1) => {
    if (disabled(d_1)) {
      return;
    }
    if (!controlledValue) {
      setOwnValue(d_1);
    }
    if (props.onValueChange) {
      props.onValueChange(d_1, {
        iso: isoDate(d_1)
      });
    }
    if (!cal.same(d_1, month)) {
      showMonth(d_1);
    }
    setFocus(d_1);
  };
  let t11;
  if ($[32] !== cal || $[33] !== min) {
    t11 = (v) => min ? v === "months" ? cal.index(min) : Math.floor(cal.index(min) / 12) : null;
    $[32] = cal;
    $[33] = min;
    $[34] = t11;
  } else {
    t11 = $[34];
  }
  const minN = t11;
  let t12;
  if ($[35] !== cal || $[36] !== max) {
    t12 = (v_0) => max ? v_0 === "months" ? cal.index(max) : Math.floor(cal.index(max) / 12) : null;
    $[35] = cal;
    $[36] = max;
    $[37] = t12;
  } else {
    t12 = $[37];
  }
  const maxN = t12;
  let t13;
  if ($[38] !== maxN || $[39] !== minN) {
    t13 = (v_1, n_0) => {
      const lo = minN(v_1);
      const hi = maxN(v_1);
      return lo != null && n_0 < lo ? lo : hi != null && n_0 > hi ? hi : n_0;
    };
    $[38] = maxN;
    $[39] = minN;
    $[40] = t13;
  } else {
    t13 = $[40];
  }
  const clampN = t13;
  const showPeriods = (v_2, n_1) => {
    setView(v_2);
    setPFocus(clampN(v_2, n_1));
    wantPeriod.current = "grid";
  };
  const pickPeriod = (n_2) => {
    if (view === "days") {
      return;
    }
    if (clampN(view, n_2) !== n_2) {
      return;
    }
    if (view === "years") {
      showPeriods("months", n_2 * 12 + inYear.current);
      return;
    }
    const m_0 = cal.at(n_2);
    let d_2 = cal.add(focus, n_2 - cal.index(focus));
    if (min && compare(d_2, min) < 0) {
      d_2 = day(min);
    }
    if (max && compare(d_2, max) > 0) {
      d_2 = day(max);
    }
    setFocus(d_2);
    setView("days");
    showMonth(m_0);
    wantFocus.current = true;
  };
  const back = () => {
    if (view === "years") {
      showPeriods("months", pFocus * 12 + inYear.current);
    } else {
      setView("days");
      wantPeriod.current = "heading";
    }
  };
  const onPeriodKey = (e) => {
    if (view === "days" || isComposing(e)) {
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      back();
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const k = gridKey(e);
    if (!k) {
      return;
    }
    e.preventDefault();
    if (k === "pick") {
      pickPeriod(pFocus);
      return;
    }
    setPFocus(clampN(view, periodCell(k, pFocus, pPage, 3, 12)));
    wantPeriod.current = "grid";
  };
  let t14;
  if ($[41] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t14 = () => {
      const want = wantPeriod.current;
      if (!want) {
        return;
      }
      wantPeriod.current = null;
      const b_0 = want === "heading" ? heading.current : periods.current && periods.current.querySelector('button[tabindex="0"]');
      if (b_0) {
        b_0.focus();
      }
    };
    $[41] = t14;
  } else {
    t14 = $[41];
  }
  React.useEffect(t14);
  const onKeyDown = (e_0) => {
    if (e_0.altKey || e_0.ctrlKey || e_0.metaKey) {
      return;
    }
    const k_0 = gridKey(e_0);
    if (!k_0) {
      return;
    }
    e_0.preventDefault();
    if (k_0 === "pick") {
      pick(focus);
      return;
    }
    let n_3 = dayCell(k_0, focus, ws) ?? cal.add(focus, (k_0 === "pageUp" ? -1 : 1) * (e_0.shiftKey ? 12 : 1));
    if (min && compare(n_3, min) < 0) {
      n_3 = day(min);
    }
    if (max && compare(n_3, max) > 0) {
      n_3 = day(max);
    }
    move(n_3);
  };
  const stop = hydrated ? focus : value && cal.same(value, month) ? value : month;
  const first = startOfWeek(month, ws);
  const fmts = formats(locale, cal);
  const {
    short,
    long,
    month: monthName
  } = fmts;
  const title = fmts.title.format(month);
  const pPage = Math.floor(pFocus / 12) * 12;
  const periodTitle = view === "months" ? yearText(fmts, cal, pPage / 12) : view === "years" ? yearText(fmts, cal, pPage) + "\u2013" + yearText(fmts, cal, pPage + 11) : "";
  const handover = useFocusHandover();
  const presets = props.presets === true ? dayPresets(sds.labels) : Array.isArray(props.presets) && props.presets.length ? props.presets.map(_temp2) : null;
  let t15;
  if ($[42] !== focus || $[43] !== props) {
    t15 = (d_3) => {
      if (!sameDay(d_3, focus)) {
        setFocus(d_3);
      }
      if (props.onDayHover) {
        props.onDayHover(d_3);
      }
    };
    $[42] = focus;
    $[43] = props;
    $[44] = t15;
  } else {
    t15 = $[44];
  }
  let t16;
  if ($[45] !== pick || $[46] !== props.onDayHover || $[47] !== t15) {
    t16 = {
      pick,
      focus: t15,
      hover: props.onDayHover
    };
    $[45] = pick;
    $[46] = props.onDayHover;
    $[47] = t15;
    $[48] = t16;
  } else {
    t16 = $[48];
  }
  const handlers = t16;
  const live = useLatest(handlers);
  let t17;
  if ($[49] !== live) {
    t17 = {
      pick: (d_4) => live.current.pick(d_4),
      focus: (d_5) => live.current.focus(d_5),
      hover: (d_6) => {
        if (live.current.hover) {
          live.current.hover(d_6);
        }
      }
    };
    $[49] = live;
    $[50] = t17;
  } else {
    t17 = $[50];
  }
  const on = t17;
  const prevNav = React.useRef(null);
  const nextNav = React.useRef(null);
  const t18 = cn("srp-calendar", presets && "srp-calendar--presets", props.weekNumbers && "srp-calendar--weeks", props.pairedNav && "srp-calendar--paired-" + props.pairedNav, props.className);
  const t19 = (props.monthYearPicker || drill) && "srp-visually-hidden";
  let t20;
  if ($[51] !== t19) {
    t20 = cn("srp-calendar__title", t19);
    $[51] = t19;
    $[52] = t20;
  } else {
    t20 = $[52];
  }
  const t21 = "srp-calendar__grid";
  const t22 = "grid";
  const t23 = view !== "days" || void 0;
  let t24;
  if ($[53] !== props.weekNumbers || $[54] !== sds) {
    t24 = props.weekNumbers ? /* @__PURE__ */ React.createElement("th", { scope: "col", className: "srp-calendar__week", abbr: sds.labels.week }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, sds.labels.weekShort), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, sds.labels.week)) : null;
    $[53] = props.weekNumbers;
    $[54] = sds;
    $[55] = t24;
  } else {
    t24 = $[55];
  }
  const t25 = Array.from({
    length: 7
  }, (_, i) => addDays(first, i)).map((d_7) => /* @__PURE__ */ React.createElement("th", { key: d_7.getDay(), scope: "col", abbr: long.format(d_7) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, short.format(d_7)), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, long.format(d_7))));
  let t26;
  if ($[56] !== t24 || $[57] !== t25) {
    t26 = /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, t24, t25));
    $[56] = t24;
    $[57] = t25;
    $[58] = t26;
  } else {
    t26 = $[58];
  }
  let t27;
  if ($[59] !== stop) {
    t27 = stop.getTime();
    $[59] = stop;
    $[60] = t27;
  } else {
    t27 = $[60];
  }
  let t28;
  if ($[61] !== value) {
    t28 = value ? value.getTime() : null;
    $[61] = value;
    $[62] = t28;
  } else {
    t28 = $[62];
  }
  let t29;
  if ($[63] !== marked) {
    t29 = marked ? marked.getTime() : null;
    $[63] = marked;
    $[64] = t29;
  } else {
    t29 = $[64];
  }
  let t30;
  if ($[65] !== min) {
    t30 = min ? min.getTime() : null;
    $[65] = min;
    $[66] = t30;
  } else {
    t30 = $[66];
  }
  let t31;
  if ($[67] !== max) {
    t31 = max ? max.getTime() : null;
    $[67] = max;
    $[68] = t31;
  } else {
    t31 = $[68];
  }
  const t32 = !!props.hideOutside;
  const t33 = !!props.onDayHover;
  const t34 = props.weekNumbers ? sds.labels.week : null;
  let t35;
  if ($[69] !== cal || $[70] !== locale || $[71] !== monthTime || $[72] !== on || $[73] !== props.dayClassName || $[74] !== props.dayLabel || $[75] !== props.isDateDisabled || $[76] !== props.isDateSelected || $[77] !== t27 || $[78] !== t28 || $[79] !== t29 || $[80] !== t30 || $[81] !== t31 || $[82] !== t32 || $[83] !== t33 || $[84] !== t34 || $[85] !== ws) {
    t35 = /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement(Weeks, { month: monthTime, ws, stop: t27, value: t28, marked: t29, min: t30, max: t31, locale, cal, isDateDisabled: props.isDateDisabled, isDateSelected: props.isDateSelected, dayLabel: props.dayLabel, dayClassName: props.dayClassName, hideOutside: t32, hover: t33, on, week: t34 }));
    $[69] = cal;
    $[70] = locale;
    $[71] = monthTime;
    $[72] = on;
    $[73] = props.dayClassName;
    $[74] = props.dayLabel;
    $[75] = props.isDateDisabled;
    $[76] = props.isDateSelected;
    $[77] = t27;
    $[78] = t28;
    $[79] = t29;
    $[80] = t30;
    $[81] = t31;
    $[82] = t32;
    $[83] = t33;
    $[84] = t34;
    $[85] = ws;
    $[86] = t35;
  } else {
    t35 = $[86];
  }
  let t36;
  if ($[87] !== lang || $[88] !== onKeyDown || $[89] !== t23 || $[90] !== t26 || $[91] !== t35 || $[92] !== titleId) {
    t36 = /* @__PURE__ */ React.createElement("table", { ref: grid, lang, className: t21, role: t22, hidden: t23, "aria-labelledby": titleId, onKeyDown }, t26, t35);
    $[87] = lang;
    $[88] = onKeyDown;
    $[89] = t23;
    $[90] = t26;
    $[91] = t35;
    $[92] = titleId;
    $[93] = t36;
  } else {
    t36 = $[93];
  }
  let t37;
  if ($[94] !== disabled || $[95] !== pick || $[96] !== presets || $[97] !== sds || $[98] !== value) {
    t37 = presets ? /* @__PURE__ */ React.createElement(PresetList, { label: sds.labels.presets, items: presets, allowed: (d_8) => !disabled(d_8), current: {
      start: value,
      end: null
    }, onPick: (it) => {
      if (it.start) {
        pick(it.start);
      }
    } }) : null;
    $[94] = disabled;
    $[95] = pick;
    $[96] = presets;
    $[97] = sds;
    $[98] = value;
    $[99] = t37;
  } else {
    t37 = $[99];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t18, "data-component": "calendar" }, /* @__PURE__ */ React.createElement("div", { className: "srp-calendar__header" }, view === "days" ? /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, className: "srp-calendar__nav srp-calendar__nav--prev", label: props.previousLabel || sds.labels.previousMonth, size: "sm", variant: "ghost", hideTitle: true, disabled: !!min && compare(addDays(month, -1), min) < 0, onClick: (e_1) => {
    handover(e_1.currentTarget, () => nextNav.current);
    showMonth(cal.add(month, -1));
  }, ref: prevNav }) : /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, className: "srp-calendar__nav srp-calendar__nav--prev", label: sds.labels.periodPrevious(view === "months" ? "month" : "year"), size: "sm", variant: "ghost", hideTitle: true, disabled: minN(view) != null && pPage - 1 < minN(view), onClick: (e_2) => {
    handover(e_2.currentTarget, () => nextNav.current);
    setPFocus(clampN(view, pFocus - 12));
  }, ref: prevNav }), /* @__PURE__ */ React.createElement(H, { className: t20, id: titleId, "data-month": isoDate(month), lang, "aria-live": "polite" }, view === "days" ? title : periodTitle), props.monthYearPicker ? /* @__PURE__ */ React.createElement(MonthYear, { cal, fmt: fmts, month, min, max, today: hydrated ? today : month, names: monthName, lang, monthLabel: sds.labels.month, yearLabel: sds.labels.year, onPick: showMonth }) : null, drill && view !== "years" ? /* @__PURE__ */ React.createElement("button", { ref: heading, type: "button", className: "srp-calendar__heading", lang, "aria-describedby": titleId + "-hint", onClick: () => view === "days" ? showPeriods("months", cal.index(month)) : (inYear.current = pFocus % 12, showPeriods("years", Math.floor(pFocus / 12))) }, view === "days" ? title : periodTitle, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-calendar__heading-icon" }), /* @__PURE__ */ React.createElement("span", { id: titleId + "-hint", hidden: true }, sds.labels.periodPlaceholder(view === "days" ? "month" : "year"))) : null, drill && view === "years" ? /* @__PURE__ */ React.createElement("span", { className: "srp-calendar__heading srp-calendar__heading--static", lang, "aria-hidden": true }, periodTitle) : null, view === "days" ? /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, className: "srp-calendar__nav srp-calendar__nav--next", label: props.nextLabel || sds.labels.nextMonth, size: "sm", variant: "ghost", hideTitle: true, disabled: !!max && compare(cal.add(month, 1), max) > 0, onClick: (e_3) => {
    handover(e_3.currentTarget, () => prevNav.current);
    showMonth(cal.add(month, 1));
  }, ref: nextNav }) : /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, className: "srp-calendar__nav srp-calendar__nav--next", label: sds.labels.periodNext(view === "months" ? "month" : "year"), size: "sm", variant: "ghost", hideTitle: true, disabled: maxN(view) != null && pPage + 12 > maxN(view), onClick: (e_4) => {
    handover(e_4.currentTarget, () => prevNav.current);
    setPFocus(clampN(view, pFocus + 12));
  }, ref: nextNav })), view !== "days" ? /* @__PURE__ */ React.createElement("table", { ref: periods, lang, role: "grid", className: "srp-calendar__periods", "data-view": view, "aria-labelledby": titleId, onKeyDown: onPeriodKey }, /* @__PURE__ */ React.createElement(Periods, { view, page: pPage, focus: pFocus, value, today: marked, min: minN(view), max: maxN(view), fmt: fmts, cal, onPick: pickPeriod, onFocus: setPFocus })) : null, t36, t37);
}
function _temp2(p) {
  return {
    label: p.label,
    start: toDay(typeof p.value === "function" ? p.value() : p.value, "Calendar"),
    end: null
  };
}
function _temp(n) {
  return n + 1;
}
var Calendar = /* @__PURE__ */ named("Calendar", CalendarRender);
function yearText(f, cal, y) {
  return f.year.format(cal.at(y * 12 + 6));
}
function Periods(p) {
  const $ = _c(13);
  let t0;
  if ($[0] !== p.cal || $[1] !== p.view) {
    t0 = (d) => d ? p.view === "months" ? p.cal.index(d) : Math.floor(p.cal.index(d) / 12) : null;
    $[0] = p.cal;
    $[1] = p.view;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const at = t0;
  let t1;
  if ($[3] !== at || $[4] !== p.value) {
    t1 = at(p.value);
    $[3] = at;
    $[4] = p.value;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  const sel = t1;
  let t2;
  if ($[6] !== at || $[7] !== p.today) {
    t2 = at(p.today);
    $[6] = at;
    $[7] = p.today;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const now = t2;
  let t3;
  if ($[9] !== now || $[10] !== p || $[11] !== sel) {
    const rows = Array.from({
      length: 4
    }, (_, r) => [0, 1, 2].map((i) => p.page + r * 3 + i));
    t3 = /* @__PURE__ */ React.createElement("tbody", null, rows.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0] }, row.map((n) => {
      const off = p.min != null && n < p.min || p.max != null && n > p.max;
      return /* @__PURE__ */ React.createElement("td", { key: n, role: "gridcell", "aria-selected": n === sel }, /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: n === p.focus ? 0 : -1, "aria-disabled": off || void 0, "aria-current": n === now ? "date" : void 0, className: cn("srp-calendar__period", n === sel && "srp-calendar__period--selected", n === now && "srp-calendar__period--today", off && "srp-calendar__period--disabled"), "data-selected": n === sel ? "" : void 0, "data-today": n === now ? "" : void 0, "data-disabled": off ? "" : void 0, onClick: () => p.onPick(n), onFocus: () => {
        if (n !== p.focus) {
          p.onFocus(n);
        }
      } }, p.view === "months" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, p.fmt.monthShort.format(p.cal.at(n))), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, p.fmt.title.format(p.cal.at(n)))) : yearText(p.fmt, p.cal, n)));
    }))));
    $[9] = now;
    $[10] = p;
    $[11] = sel;
    $[12] = t3;
  } else {
    t3 = $[12];
  }
  return t3;
}
function serverMonth(titleId) {
  const at = typeof document === "undefined" ? null : document.getElementById(titleId);
  return at ? toDay(at.getAttribute("data-month")) : null;
}
function MonthYear(p) {
  const $ = _c(64);
  const cal = p.cal;
  const n = cal.index(p.month);
  const y = Math.floor(n / 12);
  const m = n - y * 12;
  const now = Math.floor(cal.index(p.today) / 12);
  let t0;
  if ($[0] !== cal || $[1] !== p.min) {
    t0 = p.min ? cal.index(p.min) : null;
    $[0] = cal;
    $[1] = p.min;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  const lo = t0;
  let t1;
  if ($[3] !== cal || $[4] !== p.max) {
    t1 = p.max ? cal.index(p.max) : null;
    $[3] = cal;
    $[4] = p.max;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  const hi = t1;
  const from = lo != null ? Math.floor(lo / 12) : Math.min(y, now - 100);
  const to = hi != null ? Math.floor(hi / 12) : Math.max(y, now + 10);
  let t2;
  if ($[6] !== hi || $[7] !== lo) {
    t2 = (k) => lo != null && k < lo || hi != null && k > hi;
    $[6] = hi;
    $[7] = lo;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  const out = t2;
  let t3;
  if ($[9] !== cal || $[10] !== hi || $[11] !== lo || $[12] !== p) {
    t3 = (k_0) => p.onPick(cal.at(lo != null && k_0 < lo ? lo : hi != null && k_0 > hi ? hi : k_0));
    $[9] = cal;
    $[10] = hi;
    $[11] = lo;
    $[12] = p;
    $[13] = t3;
  } else {
    t3 = $[13];
  }
  const go = t3;
  let t10;
  let t11;
  let t12;
  let t4;
  let t5;
  let t6;
  let t7;
  let t8;
  let t9;
  if ($[14] !== cal || $[15] !== from || $[16] !== go || $[17] !== m || $[18] !== out || $[19] !== p.fmt || $[20] !== p.lang || $[21] !== p.monthLabel || $[22] !== p.names || $[23] !== p.yearLabel || $[24] !== to || $[25] !== y) {
    const years = [];
    for (let i = from; i <= to; i++) {
      years.push(i);
    }
    t11 = "srp-calendar__menus";
    const t132 = p.monthLabel;
    const t142 = p.lang;
    let t15;
    if ($[35] !== go || $[36] !== y) {
      t15 = (e) => go(y * 12 + +e.currentTarget.value);
      $[35] = go;
      $[36] = y;
      $[37] = t15;
    } else {
      t15 = $[37];
    }
    let t16;
    if ($[38] !== cal || $[39] !== out || $[40] !== p.names || $[41] !== y) {
      t16 = Array.from({
        length: 12
      }, (_, i_0) => /* @__PURE__ */ React.createElement("option", { key: i_0, value: i_0, disabled: out(y * 12 + i_0) }, p.names.format(cal.at(y * 12 + i_0))));
      $[38] = cal;
      $[39] = out;
      $[40] = p.names;
      $[41] = y;
      $[42] = t16;
    } else {
      t16 = $[42];
    }
    if ($[43] !== m || $[44] !== p.lang || $[45] !== p.monthLabel || $[46] !== t15 || $[47] !== t16) {
      t12 = /* @__PURE__ */ React.createElement("select", { className: "srp-calendar__menu", form: "", "aria-label": t132, lang: t142, value: m, onChange: t15 }, t16);
      $[43] = m;
      $[44] = p.lang;
      $[45] = p.monthLabel;
      $[46] = t15;
      $[47] = t16;
      $[48] = t12;
    } else {
      t12 = $[48];
    }
    t4 = "srp-calendar__menu";
    t5 = "";
    t6 = p.yearLabel;
    t7 = cal.id === "gregory" ? void 0 : p.lang;
    t8 = y;
    if ($[49] !== go || $[50] !== m) {
      t9 = (e_0) => go(+e_0.currentTarget.value * 12 + m);
      $[49] = go;
      $[50] = m;
      $[51] = t9;
    } else {
      t9 = $[51];
    }
    t10 = years.map((yy) => /* @__PURE__ */ React.createElement("option", { key: yy, value: yy }, cal.id === "gregory" ? yy : yearText(p.fmt, cal, yy)));
    $[14] = cal;
    $[15] = from;
    $[16] = go;
    $[17] = m;
    $[18] = out;
    $[19] = p.fmt;
    $[20] = p.lang;
    $[21] = p.monthLabel;
    $[22] = p.names;
    $[23] = p.yearLabel;
    $[24] = to;
    $[25] = y;
    $[26] = t10;
    $[27] = t11;
    $[28] = t12;
    $[29] = t4;
    $[30] = t5;
    $[31] = t6;
    $[32] = t7;
    $[33] = t8;
    $[34] = t9;
  } else {
    t10 = $[26];
    t11 = $[27];
    t12 = $[28];
    t4 = $[29];
    t5 = $[30];
    t6 = $[31];
    t7 = $[32];
    t8 = $[33];
    t9 = $[34];
  }
  let t13;
  if ($[52] !== t10 || $[53] !== t4 || $[54] !== t5 || $[55] !== t6 || $[56] !== t7 || $[57] !== t8 || $[58] !== t9) {
    t13 = /* @__PURE__ */ React.createElement("select", { className: t4, form: t5, "aria-label": t6, lang: t7, value: t8, onChange: t9 }, t10);
    $[52] = t10;
    $[53] = t4;
    $[54] = t5;
    $[55] = t6;
    $[56] = t7;
    $[57] = t8;
    $[58] = t9;
    $[59] = t13;
  } else {
    t13 = $[59];
  }
  let t14;
  if ($[60] !== t11 || $[61] !== t12 || $[62] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("span", { className: t11 }, t12, t13);
    $[60] = t11;
    $[61] = t12;
    $[62] = t13;
    $[63] = t14;
  } else {
    t14 = $[63];
  }
  return t14;
}
export {
  Calendar,
  isoWeek
};
//# sourceMappingURL=Calendar.js.map
