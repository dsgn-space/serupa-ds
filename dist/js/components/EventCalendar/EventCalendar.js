"use client";

// src/components/EventCalendar/EventCalendar.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { useBreakpoint } from "../../internal/media.js";
import { named } from "../../internal/component.js";
import { addDays, addMonths, compare, day, firstDayOfWeek, isValid, sameDay, sameMonth, startOfMonth, startOfWeek } from "../../internal/dates.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { localeDir } from "../../internal/locale.js";
import { displayNumber } from "../../internal/numbers.js";
import { minuteTick } from "../../internal/timing.js";
import { announce } from "../../internal/announce.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { en as CalendarWords } from "../Calendar/labels.js";
import { en as EventCalendarWords } from "./labels.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
import { isRtl } from "../../internal/position.js";
import { dayCell, gridKey } from "../../internal/gridKeys.js";
var words = /* @__PURE__ */ Object.assign({}, EventCalendarWords, CalendarWords);
function numericHour(f) {
  return {
    format: (d) => f.formatToParts(d).map((x) => x.type === "hour" ? x.value.replace(/^0(?=\d)/, "") : x.value.replace(/[\u2009\u202f]/g, " ")).join("")
  };
}
var VIEWS = ["month", "week", "day", "agenda"];
var isView = (v) => typeof v === "string" && VIEWS.includes(v);
var noSubscribe = () => () => {
};
var yes = () => true;
var no = () => false;
var DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;
function when(v) {
  if (v === void 0) return null;
  if (typeof v === "string" && DAY_ONLY.test(v)) {
    const [y = NaN, m = NaN, d2 = NaN] = v.split("-").map(Number);
    return new Date(y, m - 1, d2);
  }
  const d = v instanceof Date ? v : new Date(v);
  return isValid(d) ? d : null;
}
function toShown(events) {
  const out = [];
  for (const e of events) {
    const from = when(e.start);
    if (!from) continue;
    const to = when(e.end) || from;
    out.push({
      e,
      from,
      to: to < from ? from : to,
      allDay: !!e.allDay || typeof e.start === "string" && DAY_ONLY.test(e.start)
    });
  }
  return out.sort(byStart);
}
var byStart = (a, b) => Number(b.allDay) - Number(a.allDay) || a.from.getTime() - b.from.getTime() || a.e.title.localeCompare(b.e.title);
var onDay = (list, d) => list.filter((s) => compare(s.from, d) <= 0 && (compare(s.to, d) > 0 || compare(s.to, d) === 0 && (s.allDay || sameDay(s.from, s.to) || s.to.getHours() + s.to.getMinutes() > 0)));
var hourOf = (t, d) => sameDay(t, d) ? t.getHours() + t.getMinutes() / 60 : t < d ? 0 : 24;
function place(timed, d) {
  const out = [];
  let run = [], ends = [], runEnd = -1;
  const close = () => {
    for (const p of run) p.lanes = ends.length;
    run = [];
    ends = [];
  };
  for (const s of timed) {
    const at = Math.min(hourOf(s.from, d), 23.5), end = Math.max(hourOf(s.to, d), at + 0.5);
    if (at >= runEnd) close();
    let lane = ends.findIndex((e) => e <= at);
    if (lane < 0) {
      lane = ends.length;
      ends.push(end);
    } else ends[lane] = end;
    const p = {
      s,
      at,
      len: end - at,
      lane,
      lanes: 1
    };
    run.push(p);
    out.push(p);
    runEnd = Math.max(runEnd, end);
  }
  close();
  return out;
}
var shift = (d, days, minutes = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes() + minutes);
var QUARTER = 15;
var daysBetween = (a, b) => Math.round((day(b).getTime() - day(a).getTime()) / 864e5);
var HOURS = /* @__PURE__ */ Array.from({
  length: 24
}, (_, h) => h);
var OPEN_AT = 8;
var iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
function formatsFor(locale) {
  return {
    title: new Intl.DateTimeFormat(locale, {
      calendar: "gregory",
      numberingSystem: "latn",
      month: "long",
      year: "numeric"
    }),
    full: new Intl.DateTimeFormat(locale, {
      calendar: "gregory",
      numberingSystem: "latn",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    short: new Intl.DateTimeFormat(locale, {
      weekday: "short"
    }),
    long: new Intl.DateTimeFormat(locale, {
      weekday: "long"
    }),
    day: new Intl.DateTimeFormat(locale, {
      calendar: "gregory",
      numberingSystem: "latn",
      weekday: "long",
      month: "long",
      day: "numeric"
    }),
    time: numericHour(new Intl.DateTimeFormat(locale, {
      numberingSystem: "latn",
      hour: "numeric",
      minute: "2-digit"
    })),
    hour: numericHour(new Intl.DateTimeFormat(locale, {
      numberingSystem: "latn",
      hour: "numeric"
    })),
    range: new Intl.DateTimeFormat(locale, {
      calendar: "gregory",
      numberingSystem: "latn",
      month: "long",
      day: "numeric",
      year: "numeric"
    }),
    zone: new Intl.DateTimeFormat(locale, {
      timeZoneName: "short"
    })
  };
}
function whenOf(s, fmt, labels) {
  if (s.allDay) return sameDay(s.from, s.to) ? fmt.day.format(s.from) + ", " + labels.allDay : labels.eventTime(fmt.day.format(s.from), fmt.day.format(s.to));
  if (sameDay(s.from, s.to)) return fmt.day.format(s.from) + ", " + labels.eventTime(fmt.time.format(s.from), fmt.time.format(s.to));
  return labels.eventTime(fmt.full.format(s.from) + " " + fmt.time.format(s.from), fmt.full.format(s.to) + " " + fmt.time.format(s.to));
}
var Body = /* @__PURE__ */ React.memo(function Body2(p) {
  const $ = _c(41);
  const {
    view,
    ws,
    list,
    max,
    fmt,
    locale,
    lang,
    titleId,
    labels,
    zone,
    grid,
    scroller,
    on,
    movable
  } = p;
  let t0;
  if ($[0] !== fmt || $[1] !== grid || $[2] !== labels || $[3] !== lang || $[4] !== list || $[5] !== locale || $[6] !== max || $[7] !== movable || $[8] !== on || $[9] !== p.dir || $[10] !== p.dragging || $[11] !== p.focus || $[12] !== p.ghost || $[13] !== p.level || $[14] !== p.marked || $[15] !== p.month || $[16] !== p.now || $[17] !== scroller || $[18] !== titleId || $[19] !== view || $[20] !== ws || $[21] !== zone) {
    const month = new Date(p.month);
    const focus = new Date(p.focus);
    const marked = p.marked === null ? null : new Date(p.marked);
    const now = new Date(p.now);
    const hours = view === "week" || view === "day";
    const H2 = "h" + Math.min(6, p.level + 1);
    let t1;
    if ($[23] !== fmt || $[24] !== labels) {
      t1 = (s) => {
        if (s.allDay) {
          return labels.allDay;
        }
        const a = fmt.time.format(s.from);
        const b = fmt.time.format(s.to);
        if (sameDay(s.from, s.to)) {
          return s.to.getTime() === s.from.getTime() ? a : labels.eventTime(a, b);
        }
        return labels.eventTime(fmt.full.format(s.from) + " " + a, fmt.full.format(s.to) + " " + b);
      };
      $[23] = fmt;
      $[24] = labels;
      $[25] = t1;
    } else {
      t1 = $[25];
    }
    const timeOf = t1;
    let t2;
    if ($[26] !== fmt || $[27] !== timeOf) {
      t2 = (s_0, detail) => s_0.allDay && !detail ? "" : detail ? timeOf(s_0) : fmt.time.format(s_0.from);
      $[26] = fmt;
      $[27] = timeOf;
      $[28] = t2;
    } else {
      t2 = $[28];
    }
    const shownTime = t2;
    let t3;
    if ($[29] !== fmt || $[30] !== labels || $[31] !== shownTime || $[32] !== timeOf) {
      t3 = (s_1, day2, detail_0) => [[shownTime(s_1, detail_0), s_1.e.title].filter(Boolean).join(" "), fmt.day.format(day2), detail_0 || timeOf(s_1) === shownTime(s_1, detail_0) ? "" : timeOf(s_1), s_1.e.repeating ? labels.repeats : ""].filter(Boolean).join(", ");
      $[29] = fmt;
      $[30] = labels;
      $[31] = shownTime;
      $[32] = timeOf;
      $[33] = t3;
    } else {
      t3 = $[33];
    }
    const nameOf = t3;
    let t4;
    if ($[34] !== movable || $[35] !== nameOf || $[36] !== on || $[37] !== p.dir || $[38] !== p.dragging || $[39] !== shownTime) {
      t4 = (s_2, day_0, tab, detail_1) => /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: tab, "aria-label": nameOf(s_2, day_0, detail_1), "data-event-id": s_2.e.id, onClick: () => on.eventClick(s_2.e), "aria-keyshortcuts": movable && !detail_1 ? "Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown" : void 0, className: cn("srp-event-calendar__event", "srp-event-calendar__event--" + (s_2.e.tone || "primary"), s_2.allDay && "srp-event-calendar__event--all-day", movable && !detail_1 && "srp-event-calendar__event--movable", p.dragging === s_2.e.id && "srp-event-calendar__event--dragging"), "data-dragging": p.dragging === s_2.e.id ? "" : void 0 }, s_2.allDay && !detail_1 ? null : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__time" }, p.dir ? /* @__PURE__ */ React.createElement("span", { dir: p.dir }, shownTime(s_2, detail_1)) : shownTime(s_2, detail_1)), " "), /* @__PURE__ */ React.createElement(TruncatedText, { className: "srp-event-calendar__title" }, s_2.e.title), s_2.e.repeating ? /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__repeat", "aria-hidden": true }, "\u21BB") : null);
      $[34] = movable;
      $[35] = nameOf;
      $[36] = on;
      $[37] = p.dir;
      $[38] = p.dragging;
      $[39] = shownTime;
      $[40] = t4;
    } else {
      t4 = $[40];
    }
    const eventButton = t4;
    const first = startOfWeek(month, ws);
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const from = w * 7;
      const row = Array.from({
        length: 7
      }, (_, i) => addDays(first, from + i));
      if (w > 0 && row[0] && !sameMonth(row[0], month)) {
        break;
      }
      weeks.push(row);
    }
    const stop = weeks.some((r) => r.some((d) => sameDay(d, focus))) ? focus : marked && sameMonth(marked, month) ? marked : month;
    const days = Array.from({
      length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    }, (__0, i_0) => new Date(month.getFullYear(), month.getMonth(), i_0 + 1));
    const shownDays = view === "week" ? Array.from({
      length: 7
    }, (__1, i_1) => addDays(startOfWeek(focus, ws), i_1)) : view === "day" ? [focus] : [];
    const allDayRows = Math.max(0, ...shownDays.map((d_0) => onDay(list, d_0).filter(_temp).length));
    const busy = view === "agenda" ? days.map((d_1) => [d_1, onDay(list, d_1)]).filter(_temp2) : [];
    t0 = view === "month" ? /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "srp-event-calendar__grid", "aria-labelledby": titleId, onKeyDown: on.keyDown, onPointerDown: on.pointerDown }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, (weeks[0] ?? []).map((d_2) => /* @__PURE__ */ React.createElement("th", { key: d_2.getDay(), scope: "col", abbr: fmt.long.format(d_2) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d_2)), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.long.format(d_2)))))), /* @__PURE__ */ React.createElement("tbody", null, weeks.map((row_0) => /* @__PURE__ */ React.createElement("tr", { key: row_0[0]?.getTime() }, row_0.map((d_3) => {
      const mine = sameMonth(d_3, month) ? onDay(list, d_3) : [];
      const here = sameDay(d_3, stop);
      const isToday = marked !== null && sameDay(d_3, marked);
      const fits = mine.length > max ? mine.slice(0, max - 1) : mine;
      const more = mine.length - fits.length;
      return /* @__PURE__ */ React.createElement("td", { key: d_3.getTime(), role: "gridcell", tabIndex: here ? 0 : -1, "aria-current": isToday ? "date" : void 0, "data-date": iso(d_3), className: cn("srp-event-calendar__day", !sameMonth(d_3, month) && "srp-event-calendar__day--outside", isToday && "srp-event-calendar__day--today"), "data-outside": !sameMonth(d_3, month) ? "" : void 0, "data-today": isToday ? "" : void 0, onFocus: (e) => {
        if (e.target === e.currentTarget && !here) {
          on.setFocus(d_3);
        }
      } }, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_3) + ", " + labels.eventCount(mine.length, displayNumber(mine.length, locale))), /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__date", "aria-hidden": true }, d_3.getDate()), fits.length ? /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, fits.map((s_4) => /* @__PURE__ */ React.createElement("li", { key: s_4.e.id }, eventButton(s_4, d_3, here ? 0 : -1, false)))) : null, more > 0 ? /* @__PURE__ */ React.createElement(Popover, { title: fmt.full.format(d_3), placement: "bottom-start", trigger: /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: here ? 0 : -1, className: "srp-event-calendar__more" }, labels.moreEvents(more, displayNumber(more, locale))) }, /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events srp-event-calendar__events--all", role: "list" }, mine.map((s_5) => /* @__PURE__ */ React.createElement("li", { key: s_5.e.id }, eventButton(s_5, d_3, 0, true))))) : null);
    }))))) : hours ? /* @__PURE__ */ React.createElement("div", { ref: scroller, className: "srp-event-calendar__scroll", style: {
      "--srp-evc-all-day": allDayRows
    }, onPointerDown: on.pointerDown }, /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "srp-event-calendar__grid srp-event-calendar__hours-grid", "aria-labelledby": titleId, onKeyDown: on.keyDown, "data-days": shownDays.length }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "srp-event-calendar__zone" }, zone), shownDays.map((d_4) => /* @__PURE__ */ React.createElement("th", { key: d_4.getTime(), scope: "col", className: cn("srp-event-calendar__head", marked && sameDay(d_4, marked) && "srp-event-calendar__head--today"), "data-today": marked && sameDay(d_4, marked) ? "" : void 0 }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d_4), " ", /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__head-date" }, d_4.getDate())), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_4)))))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "srp-event-calendar__scale" }, /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__pinned" }), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__hours" }, HOURS.map((h) => /* @__PURE__ */ React.createElement("span", { key: h, "data-hour": h, style: {
      "--srp-evc-at": h
    } }, h ? /* @__PURE__ */ React.createElement("span", { dir: p.dir }, fmt.hour.format(new Date(2e3, 0, 1, h))) : "")))), shownDays.map((d_5) => {
      const mine_0 = onDay(list, d_5);
      const whole = mine_0.filter(_temp3);
      const here_0 = sameDay(d_5, focus);
      const isToday_0 = marked !== null && sameDay(d_5, marked);
      return /* @__PURE__ */ React.createElement("td", { key: d_5.getTime(), role: "gridcell", tabIndex: here_0 ? 0 : -1, "aria-current": isToday_0 ? "date" : void 0, "data-date": iso(d_5), className: cn("srp-event-calendar__day srp-event-calendar__column", isToday_0 && "srp-event-calendar__day--today"), "data-today": isToday_0 ? "" : void 0, onFocus: (e_0) => {
        if (e_0.target === e_0.currentTarget && !here_0) {
          on.setFocus(d_5);
        }
      } }, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_5) + ", " + labels.eventCount(mine_0.length, displayNumber(mine_0.length, locale))), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__pinned" }, whole.length ? /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, whole.map((s_7) => /* @__PURE__ */ React.createElement("li", { key: s_7.e.id }, eventButton(s_7, d_5, here_0 ? 0 : -1, false)))) : null), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__hours" }, isToday_0 ? /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__now", "aria-hidden": true, style: {
        "--srp-evc-at": hourOf(now, d_5)
      } }) : null, p.ghost && p.ghost.day === d_5.getTime() ? /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__ghost", "aria-hidden": true, style: {
        "--srp-evc-at": p.ghost.at,
        "--srp-evc-for": p.ghost.len
      } }) : null, /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__timed", role: "list" }, place(mine_0.filter(_temp4), d_5).map((p_0) => /* @__PURE__ */ React.createElement("li", { key: p_0.s.e.id, "data-short": p_0.len < 0.75 || void 0, style: {
        "--srp-evc-at": p_0.at,
        "--srp-evc-for": p_0.len,
        "--srp-evc-lane": p_0.lane,
        "--srp-evc-lanes": p_0.lanes
      } }, eventButton(p_0.s, d_5, here_0 ? 0 : -1, false), movable ? /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__resize", "data-resize": p_0.s.e.id, "aria-hidden": true }) : null)))));
    }))))) : busy.length ? /* @__PURE__ */ React.createElement("ol", { className: "srp-event-calendar__agenda", role: "list", "aria-labelledby": titleId, lang }, busy.map((t5) => {
      const [d_6, l_0] = t5;
      return /* @__PURE__ */ React.createElement("li", { key: d_6.getTime(), className: cn("srp-event-calendar__agenda-day", marked && sameDay(d_6, marked) && "srp-event-calendar__agenda-day--today"), "data-today": marked && sameDay(d_6, marked) ? "" : void 0, "aria-current": marked && sameDay(d_6, marked) ? "date" : void 0 }, /* @__PURE__ */ React.createElement(H2, { className: "srp-event-calendar__agenda-date" }, fmt.full.format(d_6)), /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, l_0.map((s_9) => /* @__PURE__ */ React.createElement("li", { key: s_9.e.id }, eventButton(s_9, d_6, 0, true)))));
    })) : /* @__PURE__ */ React.createElement("p", { className: "srp-event-calendar__empty" }, labels.noEvents);
    $[0] = fmt;
    $[1] = grid;
    $[2] = labels;
    $[3] = lang;
    $[4] = list;
    $[5] = locale;
    $[6] = max;
    $[7] = movable;
    $[8] = on;
    $[9] = p.dir;
    $[10] = p.dragging;
    $[11] = p.focus;
    $[12] = p.ghost;
    $[13] = p.level;
    $[14] = p.marked;
    $[15] = p.month;
    $[16] = p.now;
    $[17] = scroller;
    $[18] = titleId;
    $[19] = view;
    $[20] = ws;
    $[21] = zone;
    $[22] = t0;
  } else {
    t0 = $[22];
  }
  return t0;
});
function EventCalendarRender(t0) {
  const $ = _c(180);
  let className;
  let defaultMonth;
  let defaultView;
  let events;
  let headingLevel;
  let maxPerDay;
  let monthProp;
  let onEventClickProp;
  let onEventMove;
  let onMonthChange;
  let onSlotSelect;
  let onViewChange;
  let ownLocale;
  let props;
  let ref;
  let viewProp;
  let weekStartsOn;
  if ($[0] !== t0) {
    ({
      ref,
      events,
      locale: ownLocale,
      className,
      defaultMonth,
      defaultView,
      headingLevel,
      maxPerDay,
      month: monthProp,
      onEventClick: onEventClickProp,
      onEventMove,
      onMonthChange,
      onSlotSelect,
      onViewChange,
      view: viewProp,
      weekStartsOn,
      ...props
    } = t0);
    $[0] = t0;
    $[1] = className;
    $[2] = defaultMonth;
    $[3] = defaultView;
    $[4] = events;
    $[5] = headingLevel;
    $[6] = maxPerDay;
    $[7] = monthProp;
    $[8] = onEventClickProp;
    $[9] = onEventMove;
    $[10] = onMonthChange;
    $[11] = onSlotSelect;
    $[12] = onViewChange;
    $[13] = ownLocale;
    $[14] = props;
    $[15] = ref;
    $[16] = viewProp;
    $[17] = weekStartsOn;
  } else {
    className = $[1];
    defaultMonth = $[2];
    defaultView = $[3];
    events = $[4];
    headingLevel = $[5];
    maxPerDay = $[6];
    monthProp = $[7];
    onEventClickProp = $[8];
    onEventMove = $[9];
    onMonthChange = $[10];
    onSlotSelect = $[11];
    onViewChange = $[12];
    ownLocale = $[13];
    props = $[14];
    ref = $[15];
    viewProp = $[16];
    weekStartsOn = $[17];
  }
  const sds = useSettings(words);
  const rootRef = useServerStyles(ref);
  const rest = props;
  const locale = useLocale(ownLocale);
  const lang = useOwnLang(ownLocale);
  let t1;
  if ($[18] !== locale) {
    t1 = formatsFor(locale);
    $[18] = locale;
    $[19] = t1;
  } else {
    t1 = $[19];
  }
  const fmt = t1;
  let t2;
  if ($[20] !== ownLocale) {
    t2 = ownLocale ? localeDir(ownLocale) : void 0;
    $[20] = ownLocale;
    $[21] = t2;
  } else {
    t2 = $[21];
  }
  const dir = t2;
  const ws = Number.isFinite(weekStartsOn) ? (Math.floor(weekStartsOn) % 7 + 7) % 7 : firstDayOfWeek(locale);
  const today = day(/* @__PURE__ */ new Date());
  const controlledMonth = monthProp !== void 0;
  const titleId = domId("srp-evc", React.useId()) + "-title";
  let t3;
  if ($[22] !== defaultMonth || $[23] !== titleId) {
    t3 = () => {
      if (defaultMonth && isValid(defaultMonth)) {
        return {
          fromServer: false,
          month: startOfMonth(defaultMonth)
        };
      }
      const shown = when(typeof document === "undefined" ? void 0 : document.getElementById(titleId)?.dataset.month);
      return {
        fromServer: !!shown,
        month: startOfMonth(shown ?? /* @__PURE__ */ new Date())
      };
    };
    $[22] = defaultMonth;
    $[23] = titleId;
    $[24] = t3;
  } else {
    t3 = $[24];
  }
  const [opening] = React.useState(t3);
  const fromServer = React.useRef(opening.fromServer);
  const [ownMonth, setOwnMonth] = React.useState(opening.month);
  let t4;
  if ($[25] !== controlledMonth || $[26] !== monthProp || $[27] !== ownMonth) {
    t4 = controlledMonth && isValid(monthProp) ? startOfMonth(monthProp) : ownMonth;
    $[25] = controlledMonth;
    $[26] = monthProp;
    $[27] = ownMonth;
    $[28] = t4;
  } else {
    t4 = $[28];
  }
  const month = t4;
  let t5;
  if ($[29] !== controlledMonth || $[30] !== onMonthChange) {
    t5 = (m) => {
      const s = startOfMonth(m);
      if (!controlledMonth) {
        setOwnMonth(s);
      }
      if (onMonthChange) {
        onMonthChange(s);
      }
    };
    $[29] = controlledMonth;
    $[30] = onMonthChange;
    $[31] = t5;
  } else {
    t5 = $[31];
  }
  const showMonth = t5;
  const [ownView, setOwnView] = React.useState(isView(defaultView) ? defaultView : "month");
  let t6;
  if ($[32] !== ownView || $[33] !== viewProp) {
    t6 = isView(viewProp) ? viewProp : ownView;
    $[32] = ownView;
    $[33] = viewProp;
    $[34] = t6;
  } else {
    t6 = $[34];
  }
  const chosen = t6;
  let t7;
  if ($[35] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      serverValue: true
    };
    $[35] = t7;
  } else {
    t7 = $[35];
  }
  const narrow = !useBreakpoint("sm", t7);
  const view = narrow && chosen !== "day" ? "agenda" : chosen;
  const hours = view === "week" || view === "day";
  let t8;
  if ($[36] !== onViewChange || $[37] !== viewProp) {
    t8 = (v) => {
      if (viewProp === void 0) {
        setOwnView(v);
      }
      if (onViewChange) {
        onViewChange(v);
      }
    };
    $[36] = onViewChange;
    $[37] = viewProp;
    $[38] = t8;
  } else {
    t8 = $[38];
  }
  const setView = t8;
  let t9;
  if ($[39] !== events) {
    t9 = toShown(events);
    $[39] = events;
    $[40] = t9;
  } else {
    t9 = $[40];
  }
  const list = t9;
  let t10;
  if ($[41] !== maxPerDay) {
    t10 = Number.isFinite(maxPerDay) ? Math.max(1, Math.floor(maxPerDay)) : 3;
    $[41] = maxPerDay;
    $[42] = t10;
  } else {
    t10 = $[42];
  }
  const max = t10;
  const hydrated = React.useSyncExternalStore(noSubscribe, yes, no);
  let t11;
  if ($[43] !== controlledMonth || $[44] !== ownMonth || $[45] !== showMonth) {
    t11 = () => {
      if (!fromServer.current) {
        return;
      }
      fromServer.current = false;
      if (!controlledMonth && !sameMonth(ownMonth, /* @__PURE__ */ new Date())) {
        showMonth(/* @__PURE__ */ new Date());
      }
    };
    $[43] = controlledMonth;
    $[44] = ownMonth;
    $[45] = showMonth;
    $[46] = t11;
  } else {
    t11 = $[46];
  }
  React.useEffect(t11);
  const marked = hydrated ? today : null;
  let t12;
  if ($[47] !== defaultMonth) {
    t12 = () => defaultMonth && isValid(defaultMonth) ? day(defaultMonth) : null;
    $[47] = defaultMonth;
    $[48] = t12;
  } else {
    t12 = $[48];
  }
  const [chosenDay, setFocus] = React.useState(t12);
  const focus = chosenDay ?? (marked && sameMonth(marked, month) ? marked : month);
  let t13;
  if ($[49] !== month) {
    t13 = month.getTime();
    $[49] = month;
    $[50] = t13;
  } else {
    t13 = $[50];
  }
  const monthTime = t13;
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (chosenDay && !sameMonth(chosenDay, month)) {
      setFocus(null);
    }
  }
  const grid = React.useRef(null);
  const wantFocus = React.useRef(false);
  let t14;
  if ($[51] !== focus) {
    t14 = () => {
      if (!wantFocus.current || !grid.current) {
        return;
      }
      const cell = grid.current.querySelector('td[data-date="' + iso(focus) + '"]');
      if (!cell) {
        return;
      }
      wantFocus.current = false;
      cell.focus();
    };
    $[51] = focus;
    $[52] = t14;
  } else {
    t14 = $[52];
  }
  React.useEffect(t14);
  const step = view === "week" ? 7 : 1;
  let t15;
  if ($[53] !== month || $[54] !== setFocus || $[55] !== showMonth) {
    t15 = (n) => {
      setFocus(n);
      if (!sameMonth(n, month)) {
        showMonth(n);
      }
    };
    $[53] = month;
    $[54] = setFocus;
    $[55] = showMonth;
    $[56] = t15;
  } else {
    t15 = $[56];
  }
  const go = t15;
  const move = (d) => {
    setFocus(d);
    if (!sameMonth(d, month)) {
      showMonth(d);
    }
    wantFocus.current = true;
  };
  const movable = !!onEventMove;
  const [drag, setDrag] = React.useState(null);
  const [ghost, setGhost] = React.useState(null);
  let t16;
  if ($[57] !== drag || $[58] !== list) {
    t16 = drag ? list.map((x) => x.e.id === drag.id ? {
      ...x,
      from: new Date(drag.from),
      to: new Date(drag.to)
    } : x).sort(byStart) : list;
    $[57] = drag;
    $[58] = list;
    $[59] = t16;
  } else {
    t16 = $[59];
  }
  const drawn = t16;
  const dragged = React.useRef(false);
  const wantEvent = React.useRef(null);
  let t17;
  if ($[60] !== events) {
    t17 = () => {
      const w = wantEvent.current;
      if (!w || !grid.current) {
        return;
      }
      const cell_0 = grid.current.querySelector('td[data-date="' + w.day + '"]');
      const b = cell_0 && cell_0.querySelector('[data-event-id="' + CSS.escape(w.id) + '"]');
      if (b) {
        b.focus();
      } else {
        if (events !== w.events && cell_0) {
          cell_0.focus();
        } else {
          return;
        }
      }
      wantEvent.current = null;
    };
    $[60] = events;
    $[61] = t17;
  } else {
    t17 = $[61];
  }
  React.useEffect(t17);
  let t18;
  if ($[62] !== fmt || $[63] !== onEventMove || $[64] !== sds.labels) {
    t18 = (x_0, from, to) => {
      if (!onEventMove || from.getTime() === x_0.from.getTime() && to.getTime() === x_0.to.getTime()) {
        return;
      }
      onEventMove(x_0.e, {
        start: from,
        end: to,
        allDay: x_0.allDay
      });
      announce(sds.labels.eventChanged(x_0.e.title, whenOf({
        ...x_0,
        from,
        to
      }, fmt, sds.labels)));
    };
    $[62] = fmt;
    $[63] = onEventMove;
    $[64] = sds.labels;
    $[65] = t18;
  } else {
    t18 = $[65];
  }
  const change = t18;
  const onPointerDown = (e) => {
    dragged.current = false;
    if (e.button !== 0 || e.ctrlKey || e.metaKey) {
      return;
    }
    const t = e.target;
    const root = e.currentTarget;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const startCell = t.closest("td[data-date]");
    const startDay = startCell && when(startCell.dataset.date);
    if (!startCell || !startDay) {
      return;
    }
    const handle = t.closest("[data-resize]");
    const id = handle ? handle.dataset.resize : t.closest("[data-event-id]")?.dataset.eventId;
    const x_1 = movable && e.pointerType !== "touch" && id ? list.find((s_0) => s_0.e.id === id) : void 0;
    if (!x_1 && (id || t.closest("button") || !onSlotSelect)) {
      return;
    }
    const inHours = hours && !!t.closest(".srp-event-calendar__hours");
    const hourAt = _temp5;
    const cellAt = (cx, cy) => {
      const td_0 = document.elementFromPoint(cx, cy)?.closest("td[data-date]");
      return td_0 && root.contains(td_0) ? td_0 : null;
    };
    const h0 = inHours ? hourAt(startCell, y0) : 0;
    let moved = false;
    let last = null;
    let chosen_0 = null;
    const onMove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) {
        return;
      }
      if (!x_1 && (!inHours || ev.pointerType === "touch")) {
        return;
      }
      moved = true;
      if (!x_1) {
        const h = hourAt(startCell, ev.clientY);
        const a = Math.floor(Math.min(h0, h) * 4) / 4;
        const b_0 = Math.ceil(Math.max(h0, h) * 4) / 4;
        chosen_0 = {
          day: startDay.getTime(),
          at: a,
          len: Math.max(0.25, b_0 - a)
        };
        setGhost(chosen_0);
        return;
      }
      const td_1 = cellAt(ev.clientX, ev.clientY);
      const at = td_1 && when(td_1.dataset.date);
      if (!td_1 || !at) {
        return;
      }
      const quarter = _temp6;
      let from_0 = x_1.from;
      let to_0;
      if (handle) {
        to_0 = new Date(Math.max(shift(at, 0, quarter(hourAt(td_1, ev.clientY)) * 60).getTime(), shift(x_1.from, 0, QUARTER).getTime()));
      } else {
        const dd = daysBetween(startDay, at);
        const dm = inHours && !x_1.allDay ? Math.round((quarter(hourAt(td_1, ev.clientY)) - quarter(h0)) * 60) : 0;
        from_0 = shift(x_1.from, dd, dm);
        to_0 = shift(x_1.to, dd, dm);
      }
      if (last && last.from === from_0.getTime() && last.to === to_0.getTime()) {
        return;
      }
      last = {
        id: x_1.e.id,
        from: from_0.getTime(),
        to: to_0.getTime()
      };
      setDrag(last);
    };
    const end = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("keydown", onEscape, true);
      setDrag(null);
      setGhost(null);
    };
    const onUp = () => {
      end();
      if (x_1) {
        if (last) {
          dragged.current = true;
          change(x_1, new Date(last.from), new Date(last.to));
        }
        return;
      }
      const pick = onSlotSelect;
      if (chosen_0) {
        pick({
          start: shift(startDay, 0, chosen_0.at * 60),
          end: shift(startDay, 0, (chosen_0.at + chosen_0.len) * 60),
          allDay: false
        });
      } else {
        if (!moved) {
          const a_0 = Math.floor(h0 * 2) * 30;
          pick(inHours ? {
            start: shift(startDay, 0, a_0),
            end: shift(startDay, 0, a_0 + 60),
            allDay: false
          } : {
            start: startDay,
            end: startDay,
            allDay: true
          });
        }
      }
    };
    const onEscape = (ev_0) => {
      if (ev_0.key === "Escape") {
        ev_0.preventDefault();
        ev_0.stopPropagation();
        end();
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", end);
    window.addEventListener("keydown", onEscape, true);
  };
  const onKeyDown = (e_0) => {
    if (e_0.altKey || e_0.ctrlKey || e_0.metaKey) {
      return;
    }
    const target = e_0.target;
    if (e_0.key === "Escape" && target.tagName === "BUTTON" && !target.closest("[role=dialog]")) {
      const cell_1 = target.closest("td");
      if (cell_1) {
        e_0.preventDefault();
        cell_1.focus();
      }
      return;
    }
    dragged.current = false;
    const rtl = isRtl(e_0.currentTarget);
    const id_0 = e_0.shiftKey && movable && !target.closest("[role=dialog]") ? target.dataset.eventId : void 0;
    const moving = id_0 ? list.find((x_2) => x_2.e.id === id_0) : void 0;
    const side = e_0.key === "ArrowLeft" ? rtl ? 1 : -1 : e_0.key === "ArrowRight" ? rtl ? -1 : 1 : 0;
    const vert = e_0.key === "ArrowUp" ? -1 : e_0.key === "ArrowDown" ? 1 : 0;
    if (moving && (side || vert)) {
      e_0.preventDefault();
      const days = side + (hours ? 0 : vert * 7);
      const minutes = hours && !moving.allDay ? vert * QUARTER : 0;
      if (!days && !minutes) {
        return;
      }
      const from_1 = shift(moving.from, days, minutes);
      const landing = addDays(when(target.closest("td")?.dataset.date) || day(moving.from), daysBetween(moving.from, from_1));
      wantEvent.current = {
        id: moving.e.id,
        day: iso(landing),
        events
      };
      go(landing);
      change(moving, from_1, shift(moving.to, days, minutes));
      return;
    }
    if (target.tagName !== "TD") {
      return;
    }
    const k = gridKey(e_0);
    if (!k) {
      return;
    }
    if (k === "pick") {
      if (onSlotSelect) {
        e_0.preventDefault();
        onSlotSelect({
          start: focus,
          end: focus,
          allDay: true
        });
      }
      return;
    }
    e_0.preventDefault();
    const dir_0 = k === "pageUp" ? -1 : 1;
    move(dayCell(k, focus, ws) ?? (hours ? addDays(focus, dir_0 * step) : addMonths(focus, dir_0)));
  };
  const onEventClick = (ev_1) => {
    if (dragged.current) {
      dragged.current = false;
    } else {
      if (onEventClickProp) {
        onEventClickProp(ev_1);
      }
    }
  };
  const handlers = {
    keyDown: onKeyDown,
    pointerDown: onPointerDown,
    eventClick: onEventClick
  };
  const live = useLatest(handlers);
  let t19;
  let t20;
  if ($[66] !== live) {
    t19 = (e_1) => live.current.keyDown(e_1);
    t20 = (e_2) => live.current.pointerDown(e_2);
    $[66] = live;
    $[67] = t19;
    $[68] = t20;
  } else {
    t19 = $[67];
    t20 = $[68];
  }
  let t21;
  if ($[69] !== live) {
    t21 = (e_3) => live.current.eventClick(e_3);
    $[69] = live;
    $[70] = t21;
  } else {
    t21 = $[70];
  }
  let t22;
  if ($[71] !== setFocus || $[72] !== t19 || $[73] !== t20 || $[74] !== t21) {
    t22 = {
      keyDown: t19,
      pointerDown: t20,
      setFocus,
      eventClick: t21
    };
    $[71] = setFocus;
    $[72] = t19;
    $[73] = t20;
    $[74] = t21;
    $[75] = t22;
  } else {
    t22 = $[75];
  }
  const on = t22;
  const level = headingLevel && headingLevel >= 2 && headingLevel <= 6 ? headingLevel : 2;
  const H = "h" + level;
  const span = view === "week" ? Array.from({
    length: 7
  }, (_, i) => addDays(startOfWeek(focus, ws), i)) : view === "day" ? [focus] : [];
  const title = view === "week" && span[0] && span[6] ? fmt.range.formatRange(span[0], span[6]).replace(/\s/g, " ") : view === "day" ? fmt.full.format(focus) : fmt.title.format(month);
  const [now, setNow] = React.useState(_temp7);
  let t23;
  let t24;
  if ($[76] !== hours) {
    t23 = () => {
      if (!hours) {
        return;
      }
      const t_0 = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), minuteTick);
      return () => window.clearInterval(t_0);
    };
    t24 = [hours];
    $[76] = hours;
    $[77] = t23;
    $[78] = t24;
  } else {
    t23 = $[77];
    t24 = $[78];
  }
  React.useEffect(t23, t24);
  let t25;
  if ($[79] !== fmt.zone || $[80] !== hydrated || $[81] !== now) {
    t25 = hydrated ? fmt.zone.formatToParts(now).find(_temp8)?.value ?? "" : "";
    $[79] = fmt.zone;
    $[80] = hydrated;
    $[81] = now;
    $[82] = t25;
  } else {
    t25 = $[82];
  }
  const zone = t25;
  const timedIn = (d_0) => onDay(list, d_0).filter(_temp9);
  const scroller = React.useRef(null);
  const spanStart = span[0] ? span[0].getTime() : 0;
  const firstHour = Math.floor(Math.min(OPEN_AT, ...span.flatMap((d_1) => timedIn(d_1).map((s_2) => hourOf(s_2.from, d_1)))));
  let t26;
  if ($[83] !== firstHour) {
    t26 = () => {
      const n_0 = scroller.current;
      const mark = n_0 && n_0.querySelector('[data-hour="' + firstHour + '"]');
      const pinned = n_0 && n_0.querySelector(".srp-event-calendar__pinned");
      if (!n_0 || !mark || !pinned) {
        return;
      }
      n_0.scrollTop = n_0.scrollTop + (mark.getBoundingClientRect().top - pinned.getBoundingClientRect().bottom);
    };
    $[83] = firstHour;
    $[84] = t26;
  } else {
    t26 = $[84];
  }
  let t27;
  if ($[85] !== spanStart || $[86] !== view) {
    t27 = [view, spanStart];
    $[85] = spanStart;
    $[86] = view;
    $[87] = t27;
  } else {
    t27 = $[87];
  }
  useIsoLayoutEffect(t26, t27);
  let t28;
  if ($[88] !== className) {
    t28 = cn("srp-event-calendar", className);
    $[88] = className;
    $[89] = t28;
  } else {
    t28 = $[89];
  }
  const t29 = drag ? "" : void 0;
  let t30;
  if ($[90] !== setFocus || $[91] !== showMonth || $[92] !== today) {
    t30 = () => {
      showMonth(today);
      setFocus(today);
    };
    $[90] = setFocus;
    $[91] = showMonth;
    $[92] = today;
    $[93] = t30;
  } else {
    t30 = $[93];
  }
  let t31;
  if ($[94] !== sds.labels.goToToday || $[95] !== t30) {
    t31 = /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: t30 }, sds.labels.goToToday);
    $[94] = sds.labels.goToToday;
    $[95] = t30;
    $[96] = t31;
  } else {
    t31 = $[96];
  }
  const t32 = view === "week" ? sds.labels.previousWeek : view === "day" ? sds.labels.previousDay : sds.labels.previousMonth;
  let t33;
  if ($[97] !== focus || $[98] !== go || $[99] !== hours || $[100] !== month || $[101] !== showMonth || $[102] !== step) {
    t33 = () => hours ? go(addDays(focus, -step)) : showMonth(addMonths(month, -1));
    $[97] = focus;
    $[98] = go;
    $[99] = hours;
    $[100] = month;
    $[101] = showMonth;
    $[102] = step;
    $[103] = t33;
  } else {
    t33 = $[103];
  }
  let t34;
  if ($[104] !== t32 || $[105] !== t33) {
    t34 = /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, label: t32, size: "sm", variant: "ghost", hideTitle: true, className: "srp-event-calendar__prev", onClick: t33 });
    $[104] = t32;
    $[105] = t33;
    $[106] = t34;
  } else {
    t34 = $[106];
  }
  const t35 = view === "week" ? sds.labels.nextWeek : view === "day" ? sds.labels.nextDay : sds.labels.nextMonth;
  let t36;
  if ($[107] !== focus || $[108] !== go || $[109] !== hours || $[110] !== month || $[111] !== showMonth || $[112] !== step) {
    t36 = () => hours ? go(addDays(focus, step)) : showMonth(addMonths(month, 1));
    $[107] = focus;
    $[108] = go;
    $[109] = hours;
    $[110] = month;
    $[111] = showMonth;
    $[112] = step;
    $[113] = t36;
  } else {
    t36 = $[113];
  }
  let t37;
  if ($[114] !== t35 || $[115] !== t36) {
    t37 = /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, label: t35, size: "sm", variant: "ghost", hideTitle: true, className: "srp-event-calendar__next", onClick: t36 });
    $[114] = t35;
    $[115] = t36;
    $[116] = t37;
  } else {
    t37 = $[116];
  }
  let t38;
  if ($[117] !== t31 || $[118] !== t34 || $[119] !== t37) {
    t38 = /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__nav" }, t31, t34, t37);
    $[117] = t31;
    $[118] = t34;
    $[119] = t37;
    $[120] = t38;
  } else {
    t38 = $[120];
  }
  let t39;
  if ($[121] !== month) {
    t39 = iso(month);
    $[121] = month;
    $[122] = t39;
  } else {
    t39 = $[122];
  }
  let t40;
  if ($[123] !== dir || $[124] !== title) {
    t40 = dir ? /* @__PURE__ */ React.createElement("span", { dir }, title) : title;
    $[123] = dir;
    $[124] = title;
    $[125] = t40;
  } else {
    t40 = $[125];
  }
  let t41;
  if ($[126] !== H || $[127] !== lang || $[128] !== t39 || $[129] !== t40 || $[130] !== titleId) {
    t41 = /* @__PURE__ */ React.createElement(H, { className: "srp-event-calendar__heading", id: titleId, lang, "aria-live": "polite", "data-month": t39 }, t40);
    $[126] = H;
    $[127] = lang;
    $[128] = t39;
    $[129] = t40;
    $[130] = titleId;
    $[131] = t41;
  } else {
    t41 = $[131];
  }
  let t42;
  if ($[132] !== chosen || $[133] !== narrow || $[134] !== sds.labels.agendaView || $[135] !== sds.labels.calendarView || $[136] !== sds.labels.dayView || $[137] !== sds.labels.monthView || $[138] !== sds.labels.weekView || $[139] !== setView) {
    t42 = narrow ? null : /* @__PURE__ */ React.createElement(SegmentedControl, { size: "sm", "aria-label": sds.labels.calendarView, value: chosen, onValueChange: (v_0) => setView(isView(v_0) ? v_0 : "month"), options: [{
      value: "month",
      label: sds.labels.monthView
    }, {
      value: "week",
      label: sds.labels.weekView
    }, {
      value: "day",
      label: sds.labels.dayView
    }, {
      value: "agenda",
      label: sds.labels.agendaView
    }] });
    $[132] = chosen;
    $[133] = narrow;
    $[134] = sds.labels.agendaView;
    $[135] = sds.labels.calendarView;
    $[136] = sds.labels.dayView;
    $[137] = sds.labels.monthView;
    $[138] = sds.labels.weekView;
    $[139] = setView;
    $[140] = t42;
  } else {
    t42 = $[140];
  }
  let t43;
  if ($[141] !== t38 || $[142] !== t41 || $[143] !== t42) {
    t43 = /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__toolbar" }, t38, t41, t42);
    $[141] = t38;
    $[142] = t41;
    $[143] = t42;
    $[144] = t43;
  } else {
    t43 = $[144];
  }
  let t44;
  if ($[145] !== focus) {
    t44 = focus.getTime();
    $[145] = focus;
    $[146] = t44;
  } else {
    t44 = $[146];
  }
  let t45;
  if ($[147] !== marked) {
    t45 = marked ? marked.getTime() : null;
    $[147] = marked;
    $[148] = t45;
  } else {
    t45 = $[148];
  }
  const t46 = sds.labels;
  let t47;
  if ($[149] !== now) {
    t47 = now.getTime();
    $[149] = now;
    $[150] = t47;
  } else {
    t47 = $[150];
  }
  const t48 = drag ? drag.id : null;
  let t49;
  if ($[151] !== dir || $[152] !== drawn || $[153] !== fmt || $[154] !== ghost || $[155] !== lang || $[156] !== level || $[157] !== locale || $[158] !== max || $[159] !== monthTime || $[160] !== movable || $[161] !== on || $[162] !== sds.labels || $[163] !== t44 || $[164] !== t45 || $[165] !== t47 || $[166] !== t48 || $[167] !== titleId || $[168] !== view || $[169] !== ws || $[170] !== zone) {
    t49 = /* @__PURE__ */ React.createElement(Body, { view, month: monthTime, focus: t44, marked: t45, ws, list: drawn, max, fmt, locale, lang, dir, titleId, labels: t46, level, zone, now: t47, movable, dragging: t48, ghost, grid, scroller, on });
    $[151] = dir;
    $[152] = drawn;
    $[153] = fmt;
    $[154] = ghost;
    $[155] = lang;
    $[156] = level;
    $[157] = locale;
    $[158] = max;
    $[159] = monthTime;
    $[160] = movable;
    $[161] = on;
    $[162] = sds.labels;
    $[163] = t44;
    $[164] = t45;
    $[165] = t47;
    $[166] = t48;
    $[167] = titleId;
    $[168] = view;
    $[169] = ws;
    $[170] = zone;
    $[171] = t49;
  } else {
    t49 = $[171];
  }
  let t50;
  if ($[172] !== rest || $[173] !== rootRef || $[174] !== t28 || $[175] !== t29 || $[176] !== t43 || $[177] !== t49 || $[178] !== view) {
    t50 = /* @__PURE__ */ React.createElement("div", { ...rest, ref: rootRef, className: t28, "data-component": "event-calendar", "data-view": view, "data-dragging": t29 }, t43, t49);
    $[172] = rest;
    $[173] = rootRef;
    $[174] = t28;
    $[175] = t29;
    $[176] = t43;
    $[177] = t49;
    $[178] = view;
    $[179] = t50;
  } else {
    t50 = $[179];
  }
  return t50;
}
function _temp9(s_1) {
  return !s_1.allDay;
}
function _temp8(x_3) {
  return x_3.type === "timeZoneName";
}
function _temp7() {
  return /* @__PURE__ */ new Date();
}
function _temp6(h_0) {
  return Math.round(h_0 * 4) / 4;
}
function _temp5(td, y) {
  const r = td.querySelector(".srp-event-calendar__hours").getBoundingClientRect();
  return Math.min(24, Math.max(0, (y - r.top) / r.height * 24));
}
var EventCalendar = /* @__PURE__ */ named("EventCalendar", EventCalendarRender);
function _temp(s_3) {
  return s_3.allDay;
}
function _temp2(t0) {
  const [, l] = t0;
  return l.length;
}
function _temp3(s_6) {
  return s_6.allDay;
}
function _temp4(s_8) {
  return !s_8.allDay;
}
export {
  EventCalendar
};
//# sourceMappingURL=EventCalendar.js.map
