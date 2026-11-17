"use client";

// src/components/Calendar/Calendar.tsx
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn.js";
import { addDays, compare, day, firstDayOfWeek, isoDate, isValid, sameDay, startOfWeek, toDay } from "../../internal/dates.js";
import { calendarOf } from "../../internal/calendars.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { component } from "../../internal/component.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { useFocusHandover } from "../../internal/focus.js";
import { dayPresets, PresetList } from "../../internal/datePresets.js";
import { en as calendarWords } from "./labels.js";
import { en as periodWords } from "../PeriodPicker/labels.js";
import { isComposing } from "../../internal/ime.js";
var words = /* @__PURE__ */ Object.assign({}, calendarWords, periodWords);
var FORMATS = /* @__PURE__ */ new Map();
function header(locale) {
  const fmt = (o, at = locale) => new Intl.DateTimeFormat(at, o);
  const short = fmt({ weekday: "short" }), long = fmt({ weekday: "long" }), narrow = fmt({ weekday: "narrow" });
  const week = Array.from({ length: 7 }, (_, i) => new Date(2025, 2, 2 + i));
  const names = (f) => week.map((d) => f.format(d)).join("|");
  const wide = week.some((d) => short.format(d) === long.format(d) || /\s/.test(short.format(d))) || names(short).length > 7 * 5 - 1;
  const english = names(narrow) === names(fmt({ weekday: "narrow" }, "en")) && names(short) !== names(fmt({ weekday: "short" }, "en"));
  return wide && !english ? narrow : short;
}
function formats(locale, cal) {
  let f = FORMATS.get(locale + " " + cal.id);
  if (!f) {
    const greg = { calendar: cal.id, numberingSystem: "latn" };
    f = {
      title: new Intl.DateTimeFormat(locale, { ...greg, month: "long", year: "numeric" }),
      short: header(locale),
      long: new Intl.DateTimeFormat(locale, { weekday: "long" }),
      full: new Intl.DateTimeFormat(locale, { ...greg, weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      month: new Intl.DateTimeFormat(locale, { ...greg, month: "long" }),
      monthShort: new Intl.DateTimeFormat(locale, { ...greg, month: "short" }),
      year: new Intl.DateTimeFormat(locale, { ...greg, year: "numeric" })
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
  return weeks.map((row, w) => /* @__PURE__ */ React.createElement("tr", { key: w }, p.week != null ? /* @__PURE__ */ React.createElement("th", { scope: "row", className: "dk-calendar__week" }, /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, p.week + " "), isoWeek(row.find((d) => d.getDay() === 4) || row[0])) : null, row.map((d) => {
    const t = d.getTime(), off = !!disabled(d), sel = p.isDateSelected ? p.isDateSelected(d) : t === p.value, outside = !p.cal.same(d, month), now = t === p.marked;
    if (outside && p.hideOutside) return /* @__PURE__ */ React.createElement("td", { key: t, role: "gridcell", className: "dk-calendar__blank" });
    return /* @__PURE__ */ React.createElement("td", { key: t, "aria-selected": sel, role: "gridcell" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        tabIndex: t === p.stop ? 0 : -1,
        "aria-label": p.dayLabel ? p.dayLabel(d, full.format(d)) : full.format(d),
        "aria-disabled": off || void 0,
        "aria-current": now ? "date" : void 0,
        className: cn("dk-calendar__day", outside && "dk-calendar__day--outside", sel && "dk-calendar__day--selected", now && "dk-calendar__day--today", off && "dk-calendar__day--disabled", p.dayClassName && p.dayClassName(d)),
        "data-date": d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"),
        onClick: () => p.on.pick(d),
        onFocus: () => p.on.focus(d),
        onMouseEnter: p.hover ? () => p.on.hover(d) : void 0
      },
      p.cal.date(d)
    ));
  })));
});
var OWN = { weekNumbers: 1, value: 1, defaultValue: 1, onValueChange: 1, month: 1, defaultMonth: 1, onMonthChange: 1, min: 1, max: 1, isDateDisabled: 1, locale: 1, calendar: 1, weekStartsOn: 1, autoFocus: 1, previousLabel: 1, nextLabel: 1, monthYearPicker: 1, presets: 1, dayClassName: 1, isDateSelected: 1, onDayHover: 1, hideOutside: 1, dayLabel: 1, pairedNav: 1, onLeaveMonth: 1, className: 1 };
var never = () => () => {
};
var yes = () => true;
var no = () => false;
var Calendar = /* @__PURE__ */ component("Calendar", function Calendar2(props, ref) {
  const sds = useSettings(words);
  const rest = omit(props, OWN);
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const cal = calendarOf(props.calendar, "Calendar");
  const ws = Number.isFinite(props.weekStartsOn) ? (Math.floor(props.weekStartsOn) % 7 + 7) % 7 : firstDayOfWeek(locale);
  const controlledValue = props.value !== void 0;
  const [ownValue, setOwnValue] = React.useState(() => toDay(props.defaultValue, "Calendar"));
  const value = controlledValue ? toDay(props.value, "Calendar") : ownValue;
  const min = toDay(props.min, "Calendar"), max = toDay(props.max, "Calendar");
  const [, setTick] = React.useState(0);
  const today = day(/* @__PURE__ */ new Date());
  const todayTime = today.getTime();
  const hydrated = React.useSyncExternalStore(never, yes, no);
  const marked = hydrated ? today : null;
  React.useEffect(() => {
    const t = setTimeout(() => setTick((n) => n + 1), addDays(new Date(todayTime), 1).getTime() - Date.now() + 50);
    return () => clearTimeout(t);
  }, [todayTime]);
  const home = min && compare(today, min) < 0 ? min : max && compare(today, max) > 0 ? max : today;
  const controlledMonth = props.month !== void 0;
  const titleId = domId("dk-cal", React.useId()) + "-title";
  const drawn = React.useRef(null);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    const given = props.defaultMonth || value;
    const server = given || controlledMonth ? null : serverMonth(titleId);
    if (server) drawn.current = server.getTime();
    return cal.start(given || server || home);
  });
  const homeMonth = cal.start(home).getTime();
  const onMonthChange = props.onMonthChange;
  React.useEffect(() => {
    const was = drawn.current;
    drawn.current = null;
    if (was == null || was === homeMonth || ownMonth.getTime() !== was) return;
    setOwnMonth(new Date(homeMonth));
    if (onMonthChange) onMonthChange(new Date(homeMonth));
  }, [homeMonth, ownMonth, onMonthChange]);
  const month = controlledMonth && isValid(props.month) ? cal.start(props.month) : ownMonth;
  const [focus, setFocus] = React.useState(() => value && cal.same(value, month) ? value : cal.same(home, month) ? home : month);
  const valueTime = value ? value.getTime() : null;
  const [seen, setSeen] = React.useState(valueTime);
  if (seen !== valueTime) {
    setSeen(valueTime);
    const away = !!value && !cal.same(value, month);
    if (value && !(away && controlledMonth)) {
      setFocus(value);
      if (away) setOwnMonth(cal.start(value));
    }
  }
  const grid = React.useRef(null);
  const wantFocus = React.useRef(!!props.autoFocus);
  const drill = !props.monthYearPicker && !props.pairedNav && !props.hideOutside;
  const [view, setView] = React.useState("days");
  const [pFocus, setPFocus] = React.useState(0);
  const periods = React.useRef(null), heading = React.useRef(null);
  const wantPeriod = React.useRef(null);
  const inYear = React.useRef(0);
  const disabled = (d) => min && compare(d, min) < 0 || max && compare(d, max) > 0 || (props.isDateDisabled ? props.isDateDisabled(d) : false);
  const showMonth = (m) => {
    const s = cal.start(m);
    if (!controlledMonth) setOwnMonth(s);
    if (props.onMonthChange) props.onMonthChange(s);
  };
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (!cal.same(focus, month)) setFocus(value && cal.same(value, month) ? value : cal.same(home, month) ? home : month);
  }
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    const b = grid.current.querySelector('button[tabindex="0"]');
    if (b) b.focus();
  });
  const move = (d) => {
    if (!cal.same(d, month) && props.onLeaveMonth && props.onLeaveMonth(d)) return;
    setFocus(d);
    if (!cal.same(d, month)) showMonth(d);
    wantFocus.current = true;
  };
  const pick = (d) => {
    if (disabled(d)) return;
    if (!controlledValue) setOwnValue(d);
    if (props.onValueChange) props.onValueChange(d, isoDate(d));
    if (!cal.same(d, month)) showMonth(d);
    setFocus(d);
  };
  const minN = (v) => min ? v === "months" ? cal.index(min) : Math.floor(cal.index(min) / 12) : null;
  const maxN = (v) => max ? v === "months" ? cal.index(max) : Math.floor(cal.index(max) / 12) : null;
  const clampN = (v, n) => {
    const lo = minN(v), hi = maxN(v);
    return lo != null && n < lo ? lo : hi != null && n > hi ? hi : n;
  };
  const showPeriods = (v, n) => {
    setView(v);
    setPFocus(clampN(v, n));
    wantPeriod.current = "grid";
  };
  const pickPeriod = (n) => {
    if (view === "days") return;
    if (clampN(view, n) !== n) return;
    if (view === "years") {
      showPeriods("months", n * 12 + inYear.current);
      return;
    }
    const m = cal.at(n);
    let d = cal.add(focus, n - cal.index(focus));
    if (min && compare(d, min) < 0) d = day(min);
    if (max && compare(d, max) > 0) d = day(max);
    setFocus(d);
    setView("days");
    showMonth(m);
    wantFocus.current = true;
  };
  const back = () => {
    if (view === "years") showPeriods("months", pFocus * 12 + inYear.current);
    else {
      setView("days");
      wantPeriod.current = "heading";
    }
  };
  const onPeriodKey = (e) => {
    if (view === "days" || isComposing(e)) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      back();
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl", rowStart = pFocus - (pFocus - pPage) % 3;
    let n;
    switch (e.key) {
      case "ArrowLeft":
        n = pFocus + (rtl ? 1 : -1);
        break;
      case "ArrowRight":
        n = pFocus + (rtl ? -1 : 1);
        break;
      case "ArrowUp":
        n = pFocus - 3;
        break;
      case "ArrowDown":
        n = pFocus + 3;
        break;
      case "Home":
        n = rowStart;
        break;
      case "End":
        n = rowStart + 2;
        break;
      case "PageUp":
        n = pFocus - 12;
        break;
      case "PageDown":
        n = pFocus + 12;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pickPeriod(pFocus);
        return;
      default:
        return;
    }
    e.preventDefault();
    setPFocus(clampN(view, n));
    wantPeriod.current = "grid";
  };
  React.useEffect(() => {
    const want = wantPeriod.current;
    if (!want) return;
    wantPeriod.current = null;
    const b = want === "heading" ? heading.current : periods.current && periods.current.querySelector('button[tabindex="0"]');
    if (b) b.focus();
  });
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let n = null;
    switch (e.key) {
      case "ArrowLeft":
        n = addDays(focus, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        n = addDays(focus, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        n = addDays(focus, -7);
        break;
      case "ArrowDown":
        n = addDays(focus, 7);
        break;
      case "Home":
        n = startOfWeek(focus, ws);
        break;
      case "End":
        n = addDays(startOfWeek(focus, ws), 6);
        break;
      case "PageUp":
        n = cal.add(focus, e.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        n = cal.add(focus, e.shiftKey ? 12 : 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(focus);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (min && compare(n, min) < 0) n = day(min);
    if (max && compare(n, max) > 0) n = day(max);
    move(n);
  };
  const stop = hydrated ? focus : value && cal.same(value, month) ? value : month;
  const first = startOfWeek(month, ws);
  const fmts = formats(locale, cal), { short, long, month: monthName } = fmts, title = fmts.title.format(month);
  const pPage = Math.floor(pFocus / 12) * 12;
  const periodTitle = view === "months" ? yearText(fmts, cal, pPage / 12) : view === "years" ? yearText(fmts, cal, pPage) + "\u2013" + yearText(fmts, cal, pPage + 11) : "";
  const handover = useFocusHandover();
  const presets = props.presets === true ? dayPresets(sds.labels) : Array.isArray(props.presets) && props.presets.length ? props.presets.map((p) => ({ label: p.label, start: toDay(typeof p.value === "function" ? p.value() : p.value, "Calendar"), end: null })) : null;
  const handlers = { pick, focus: (d) => {
    if (!sameDay(d, focus)) setFocus(d);
    if (props.onDayHover) props.onDayHover(d);
  }, hover: props.onDayHover };
  const live = React.useRef(handlers);
  live.current = handlers;
  const on = React.useMemo(() => ({ pick: (d) => live.current.pick(d), focus: (d) => live.current.focus(d), hover: (d) => {
    if (live.current.hover) live.current.hover(d);
  } }), []);
  const prevNav = React.useRef(null), nextNav = React.useRef(null);
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-calendar", presets && "dk-calendar--presets", props.weekNumbers && "dk-calendar--weeks", props.pairedNav && "dk-calendar--paired-" + props.pairedNav, props.className), "data-component": "calendar" }, /* @__PURE__ */ React.createElement("div", { className: "dk-calendar__header" }, view === "days" ? /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronLeft,
      className: "dk-calendar__nav dk-calendar__nav--prev",
      label: props.previousLabel || sds.labels.previousMonth,
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      disabled: !!min && compare(addDays(month, -1), min) < 0,
      onClick: (e) => {
        handover(e.currentTarget, () => nextNav.current);
        showMonth(cal.add(month, -1));
      },
      ref: prevNav
    }
  ) : /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronLeft,
      className: "dk-calendar__nav dk-calendar__nav--prev",
      label: sds.labels.periodPrevious(view === "months" ? "month" : "year"),
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      disabled: minN(view) != null && pPage - 1 < minN(view),
      onClick: (e) => {
        handover(e.currentTarget, () => nextNav.current);
        setPFocus(clampN(view, pFocus - 12));
      },
      ref: prevNav
    }
  ), /* @__PURE__ */ React.createElement("h2", { className: cn("dk-calendar__title", (props.monthYearPicker || drill) && "dk-visually-hidden"), id: titleId, "data-month": isoDate(month), lang, "aria-live": "polite" }, view === "days" ? title : periodTitle), props.monthYearPicker ? /* @__PURE__ */ React.createElement(MonthYear, { cal, fmt: fmts, month, min, max, today: hydrated ? today : month, names: monthName, lang, monthLabel: sds.labels.month, yearLabel: sds.labels.year, onPick: showMonth }) : null, drill && view !== "years" ? /* @__PURE__ */ React.createElement(
    "button",
    {
      ref: heading,
      type: "button",
      className: "dk-calendar__heading",
      lang,
      "aria-describedby": titleId + "-hint",
      onClick: () => view === "days" ? showPeriods("months", cal.index(month)) : (inYear.current = pFocus % 12, showPeriods("years", Math.floor(pFocus / 12)))
    },
    view === "days" ? title : periodTitle,
    /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "dk-calendar__heading-icon" }),
    /* @__PURE__ */ React.createElement("span", { id: titleId + "-hint", hidden: true }, sds.labels.periodPlaceholder(view === "days" ? "month" : "year"))
  ) : null, drill && view === "years" ? /* @__PURE__ */ React.createElement("span", { className: "dk-calendar__heading dk-calendar__heading--static", lang, "aria-hidden": true }, periodTitle) : null, view === "days" ? /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronRight,
      className: "dk-calendar__nav dk-calendar__nav--next",
      label: props.nextLabel || sds.labels.nextMonth,
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      disabled: !!max && compare(cal.add(month, 1), max) > 0,
      onClick: (e) => {
        handover(e.currentTarget, () => prevNav.current);
        showMonth(cal.add(month, 1));
      },
      ref: nextNav
    }
  ) : /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronRight,
      className: "dk-calendar__nav dk-calendar__nav--next",
      label: sds.labels.periodNext(view === "months" ? "month" : "year"),
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      disabled: maxN(view) != null && pPage + 12 > maxN(view),
      onClick: (e) => {
        handover(e.currentTarget, () => prevNav.current);
        setPFocus(clampN(view, pFocus + 12));
      },
      ref: nextNav
    }
  )), view !== "days" ? /* @__PURE__ */ React.createElement("table", { ref: periods, lang, role: "grid", className: "dk-calendar__periods", "data-view": view, "aria-labelledby": titleId, onKeyDown: onPeriodKey }, /* @__PURE__ */ React.createElement(Periods, { view, page: pPage, focus: pFocus, value, today: marked, min: minN(view), max: maxN(view), fmt: fmts, cal, onPick: pickPeriod, onFocus: setPFocus })) : null, /* @__PURE__ */ React.createElement("table", { ref: grid, lang, className: "dk-calendar__grid", role: "grid", hidden: view !== "days" || void 0, "aria-labelledby": titleId, onKeyDown }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, props.weekNumbers ? /* @__PURE__ */ React.createElement("th", { scope: "col", className: "dk-calendar__week", abbr: sds.labels.week }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, sds.labels.weekShort), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, sds.labels.week)) : null, Array.from({ length: 7 }, (_, i) => addDays(first, i)).map((d) => /* @__PURE__ */ React.createElement("th", { key: d.getDay(), scope: "col", abbr: long.format(d) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, short.format(d)), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, long.format(d)))))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement(
    Weeks,
    {
      month: monthTime,
      ws,
      stop: stop.getTime(),
      value: value ? value.getTime() : null,
      marked: marked ? marked.getTime() : null,
      min: min ? min.getTime() : null,
      max: max ? max.getTime() : null,
      locale,
      cal,
      isDateDisabled: props.isDateDisabled,
      isDateSelected: props.isDateSelected,
      dayLabel: props.dayLabel,
      dayClassName: props.dayClassName,
      hideOutside: !!props.hideOutside,
      hover: !!props.onDayHover,
      on,
      week: props.weekNumbers ? sds.labels.week : null
    }
  ))), presets ? /* @__PURE__ */ React.createElement(PresetList, { label: sds.labels.presets, items: presets, allowed: (d) => !disabled(d), current: { start: value, end: null }, onPick: (it) => {
    if (it.start) pick(it.start);
  } }) : null);
});
function yearText(f, cal, y) {
  return f.year.format(cal.at(y * 12 + 6));
}
function Periods(p) {
  const at = (d) => d ? p.view === "months" ? p.cal.index(d) : Math.floor(p.cal.index(d) / 12) : null;
  const sel = at(p.value), now = at(p.today);
  const rows = [];
  for (let r = 0; r < 4; r++) rows.push([0, 1, 2].map((i) => p.page + r * 3 + i));
  return /* @__PURE__ */ React.createElement("tbody", null, rows.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0] }, row.map((n) => {
    const off = p.min != null && n < p.min || p.max != null && n > p.max;
    return /* @__PURE__ */ React.createElement("td", { key: n, role: "gridcell", "aria-selected": n === sel }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        tabIndex: n === p.focus ? 0 : -1,
        "aria-disabled": off || void 0,
        "aria-current": n === now ? "date" : void 0,
        className: cn("dk-calendar__period", n === sel && "dk-calendar__period--selected", n === now && "dk-calendar__period--today", off && "dk-calendar__period--disabled"),
        onClick: () => p.onPick(n),
        onFocus: () => {
          if (n !== p.focus) p.onFocus(n);
        }
      },
      p.view === "months" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, p.fmt.monthShort.format(p.cal.at(n))), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, p.fmt.title.format(p.cal.at(n)))) : yearText(p.fmt, p.cal, n)
    ));
  }))));
}
function serverMonth(titleId) {
  const at = typeof document === "undefined" ? null : document.getElementById(titleId);
  return at ? toDay(at.getAttribute("data-month")) : null;
}
function MonthYear(p) {
  const cal = p.cal, n = cal.index(p.month), y = Math.floor(n / 12), m = n - y * 12, now = Math.floor(cal.index(p.today) / 12);
  const lo = p.min ? cal.index(p.min) : null, hi = p.max ? cal.index(p.max) : null;
  const from = lo != null ? Math.floor(lo / 12) : Math.min(y, now - 100);
  const to = hi != null ? Math.floor(hi / 12) : Math.max(y, now + 10);
  const out = (k) => lo != null && k < lo || hi != null && k > hi;
  const go = (k) => p.onPick(cal.at(lo != null && k < lo ? lo : hi != null && k > hi ? hi : k));
  const years = [];
  for (let i = from; i <= to; i++) years.push(i);
  return /* @__PURE__ */ React.createElement("span", { className: "dk-calendar__menus" }, /* @__PURE__ */ React.createElement("select", { className: "dk-calendar__menu", form: "", "aria-label": p.monthLabel, lang: p.lang, value: m, onChange: (e) => go(y * 12 + +e.currentTarget.value) }, Array.from({ length: 12 }, (_, i) => /* @__PURE__ */ React.createElement("option", { key: i, value: i, disabled: out(y * 12 + i) }, p.names.format(cal.at(y * 12 + i))))), /* @__PURE__ */ React.createElement("select", { className: "dk-calendar__menu", form: "", "aria-label": p.yearLabel, lang: cal.id === "gregory" ? void 0 : p.lang, value: y, onChange: (e) => go(+e.currentTarget.value * 12 + m) }, years.map((yy) => /* @__PURE__ */ React.createElement("option", { key: yy, value: yy }, cal.id === "gregory" ? yy : yearText(p.fmt, cal, yy)))));
}
export {
  Calendar,
  isoWeek
};
//# sourceMappingURL=Calendar.js.map
