"use client";

// src/components/EventCalendar/EventCalendar.tsx
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn.js";
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
  const month = new Date(p.month), focus = new Date(p.focus), marked = p.marked === null ? null : new Date(p.marked), now = new Date(p.now);
  const hours = view === "week" || view === "day";
  const H2 = "h" + Math.min(6, p.level + 1);
  const timeOf = (s) => {
    if (s.allDay) return labels.allDay;
    const a = fmt.time.format(s.from), b = fmt.time.format(s.to);
    if (sameDay(s.from, s.to)) return s.to.getTime() === s.from.getTime() ? a : labels.eventTime(a, b);
    return labels.eventTime(fmt.full.format(s.from) + " " + a, fmt.full.format(s.to) + " " + b);
  };
  const shownTime = (s_0, detail) => s_0.allDay && !detail ? "" : detail ? timeOf(s_0) : fmt.time.format(s_0.from);
  const nameOf = (s_1, day2, detail_0) => [[shownTime(s_1, detail_0), s_1.e.title].filter(Boolean).join(" "), fmt.day.format(day2), detail_0 || timeOf(s_1) === shownTime(s_1, detail_0) ? "" : timeOf(s_1), s_1.e.repeating ? labels.repeats : ""].filter(Boolean).join(", ");
  const eventButton = (s_2, day_0, tab, detail_1) => /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: tab, "aria-label": nameOf(s_2, day_0, detail_1), "data-event-id": s_2.e.id, onClick: () => on.eventClick(s_2.e), "aria-keyshortcuts": movable && !detail_1 ? "Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown" : void 0, className: cn("srp-event-calendar__event", "srp-event-calendar__event--" + (s_2.e.tone || "primary"), s_2.allDay && "srp-event-calendar__event--all-day", movable && !detail_1 && "srp-event-calendar__event--movable", p.dragging === s_2.e.id && "srp-event-calendar__event--dragging") }, s_2.allDay && !detail_1 ? null : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__time" }, p.dir ? /* @__PURE__ */ React.createElement("span", { dir: p.dir }, shownTime(s_2, detail_1)) : shownTime(s_2, detail_1)), " "), /* @__PURE__ */ React.createElement(TruncatedText, { className: "srp-event-calendar__title" }, s_2.e.title), s_2.e.repeating ? /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__repeat", "aria-hidden": true }, "\u21BB") : null);
  const first = startOfWeek(month, ws);
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({
      length: 7
    }, (_, i) => addDays(first, w * 7 + i));
    if (w > 0 && row[0] && !sameMonth(row[0], month)) break;
    weeks.push(row);
  }
  const stop = weeks.some((r) => r.some((d) => sameDay(d, focus))) ? focus : marked && sameMonth(marked, month) ? marked : month;
  const days = Array.from({
    length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  }, (__0, i_0) => new Date(month.getFullYear(), month.getMonth(), i_0 + 1));
  const span = view === "week" ? Array.from({
    length: 7
  }, (__1, i_1) => addDays(startOfWeek(focus, ws), i_1)) : view === "day" ? [focus] : [];
  const allDayRows = Math.max(0, ...span.map((d_0) => onDay(list, d_0).filter((s_3) => s_3.allDay).length));
  const busy = view === "agenda" ? days.map((d_1) => [d_1, onDay(list, d_1)]).filter(([, l]) => l.length) : [];
  return view === "month" ? /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "srp-event-calendar__grid", "aria-labelledby": titleId, onKeyDown: on.keyDown, onPointerDown: on.pointerDown }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, (weeks[0] ?? []).map((d_2) => /* @__PURE__ */ React.createElement("th", { key: d_2.getDay(), scope: "col", abbr: fmt.long.format(d_2) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d_2)), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.long.format(d_2)))))), /* @__PURE__ */ React.createElement("tbody", null, weeks.map((row_0) => /* @__PURE__ */ React.createElement("tr", { key: row_0[0]?.getTime() }, row_0.map((d_3) => {
    const mine = sameMonth(d_3, month) ? onDay(list, d_3) : [], here = sameDay(d_3, stop), isToday = marked !== null && sameDay(d_3, marked);
    const fits = mine.length > max ? mine.slice(0, max - 1) : mine, more = mine.length - fits.length;
    return /* @__PURE__ */ React.createElement("td", { key: d_3.getTime(), role: "gridcell", tabIndex: here ? 0 : -1, "aria-current": isToday ? "date" : void 0, "data-date": iso(d_3), className: cn("srp-event-calendar__day", !sameMonth(d_3, month) && "srp-event-calendar__day--outside", isToday && "srp-event-calendar__day--today"), onFocus: (e) => {
      if (e.target === e.currentTarget && !here) on.setFocus(d_3);
    } }, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_3) + ", " + labels.eventCount(mine.length, displayNumber(mine.length, locale))), /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__date", "aria-hidden": true }, d_3.getDate()), fits.length ? /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, fits.map((s_4) => /* @__PURE__ */ React.createElement("li", { key: s_4.e.id }, eventButton(s_4, d_3, here ? 0 : -1, false)))) : null, more > 0 ? /* @__PURE__ */ React.createElement(Popover, { title: fmt.full.format(d_3), placement: "bottom-start", trigger: /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: here ? 0 : -1, className: "srp-event-calendar__more" }, labels.moreEvents(more, displayNumber(more, locale))) }, /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events srp-event-calendar__events--all", role: "list" }, mine.map((s_5) => /* @__PURE__ */ React.createElement("li", { key: s_5.e.id }, eventButton(s_5, d_3, 0, true))))) : null);
  }))))) : hours ? (
    /* The days' hours: a grid of one row, a cell a day, so the keys, the names and the Tab stop are the month's.
       The weekday names and the all-day events stay pinned at the top while the hours scroll under them. The
       hour scale and the time zone are drawn beside, hidden from screen readers: each event says its time. */
    /* @__PURE__ */ React.createElement("div", { ref: scroller, className: "srp-event-calendar__scroll", style: {
      "--srp-evc-all-day": allDayRows
    }, onPointerDown: on.pointerDown }, /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "srp-event-calendar__grid srp-event-calendar__hours-grid", "aria-labelledby": titleId, onKeyDown: on.keyDown, "data-days": span.length }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "srp-event-calendar__zone" }, zone), span.map((d_4) => /* @__PURE__ */ React.createElement("th", { key: d_4.getTime(), scope: "col", className: cn(marked && sameDay(d_4, marked) && "srp-event-calendar__head--today") }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d_4), " ", /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__head-date" }, d_4.getDate())), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_4)))))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "srp-event-calendar__scale" }, /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__pinned" }), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__hours" }, HOURS.map((h) => /* @__PURE__ */ React.createElement("span", { key: h, "data-hour": h, style: {
      "--srp-evc-at": h
    } }, h ? /* @__PURE__ */ React.createElement("span", { dir: p.dir }, fmt.hour.format(new Date(2e3, 0, 1, h))) : "")))), span.map((d_5) => {
      const mine_0 = onDay(list, d_5), whole = mine_0.filter((s_6) => s_6.allDay), here_0 = sameDay(d_5, focus), isToday_0 = marked !== null && sameDay(d_5, marked);
      return /* @__PURE__ */ React.createElement("td", { key: d_5.getTime(), role: "gridcell", tabIndex: here_0 ? 0 : -1, "aria-current": isToday_0 ? "date" : void 0, "data-date": iso(d_5), className: cn("srp-event-calendar__day srp-event-calendar__column", isToday_0 && "srp-event-calendar__day--today"), onFocus: (e_0) => {
        if (e_0.target === e_0.currentTarget && !here_0) on.setFocus(d_5);
      } }, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, fmt.full.format(d_5) + ", " + labels.eventCount(mine_0.length, displayNumber(mine_0.length, locale))), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__pinned" }, whole.length ? /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, whole.map((s_7) => /* @__PURE__ */ React.createElement("li", { key: s_7.e.id }, eventButton(s_7, d_5, here_0 ? 0 : -1, false)))) : null), /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__hours" }, isToday_0 ? /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__now", "aria-hidden": true, style: {
        "--srp-evc-at": hourOf(now, d_5)
      } }) : null, p.ghost && p.ghost.day === d_5.getTime() ? /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__ghost", "aria-hidden": true, style: {
        "--srp-evc-at": p.ghost.at,
        "--srp-evc-for": p.ghost.len
      } }) : null, /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__timed", role: "list" }, place(mine_0.filter((s_8) => !s_8.allDay), d_5).map((p_0) => /* @__PURE__ */ React.createElement("li", { key: p_0.s.e.id, "data-short": p_0.len < 0.75 || void 0, style: {
        "--srp-evc-at": p_0.at,
        "--srp-evc-for": p_0.len,
        "--srp-evc-lane": p_0.lane,
        "--srp-evc-lanes": p_0.lanes
      } }, eventButton(p_0.s, d_5, here_0 ? 0 : -1, false), movable ? /* @__PURE__ */ React.createElement("span", { className: "srp-event-calendar__resize", "data-resize": p_0.s.e.id, "aria-hidden": true }) : null)))));
    })))))
  ) : busy.length ? /* @__PURE__ */ React.createElement("ol", { className: "srp-event-calendar__agenda", role: "list", "aria-labelledby": titleId, lang }, busy.map(([d_6, l_0]) => /* @__PURE__ */ React.createElement("li", { key: d_6.getTime(), className: cn("srp-event-calendar__agenda-day", marked && sameDay(d_6, marked) && "srp-event-calendar__agenda-day--today"), "aria-current": marked && sameDay(d_6, marked) ? "date" : void 0 }, /* @__PURE__ */ React.createElement(H2, { className: "srp-event-calendar__agenda-date" }, fmt.full.format(d_6)), /* @__PURE__ */ React.createElement("ul", { className: "srp-event-calendar__events", role: "list" }, l_0.map((s_9) => /* @__PURE__ */ React.createElement("li", { key: s_9.e.id }, eventButton(s_9, d_6, 0, true))))))) : /* @__PURE__ */ React.createElement("p", { className: "srp-event-calendar__empty" }, labels.noEvents);
});
function EventCalendarRender({
  ref,
  ...props
}) {
  const sds = useSettings(words);
  const rootRef = useServerStyles(ref);
  const rest = omit(props, {
    events: 1,
    onEventClick: 1,
    onSlotSelect: 1,
    onEventMove: 1,
    month: 1,
    defaultMonth: 1,
    onMonthChange: 1,
    view: 1,
    defaultView: 1,
    onViewChange: 1,
    maxPerDay: 1,
    locale: 1,
    weekStartsOn: 1,
    headingLevel: 1,
    className: 1
  });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const dir = props.locale ? localeDir(props.locale) : void 0;
  const ws = Number.isFinite(props.weekStartsOn) ? (Math.floor(props.weekStartsOn) % 7 + 7) % 7 : firstDayOfWeek(locale);
  const today = day(/* @__PURE__ */ new Date());
  const controlledMonth = props.month !== void 0;
  const titleId = domId("srp-evc", React.useId()) + "-title";
  const fromServer = React.useRef(false);
  const [ownMonth, setOwnMonth] = React.useState(() => {
    if (props.defaultMonth && isValid(props.defaultMonth)) return startOfMonth(props.defaultMonth);
    const shown = when(typeof document === "undefined" ? void 0 : document.getElementById(titleId)?.dataset.month);
    fromServer.current = !!shown;
    return startOfMonth(shown ?? /* @__PURE__ */ new Date());
  });
  const month = controlledMonth && isValid(props.month) ? startOfMonth(props.month) : ownMonth;
  const showMonth = (m) => {
    const s = startOfMonth(m);
    if (!controlledMonth) setOwnMonth(s);
    if (props.onMonthChange) props.onMonthChange(s);
  };
  const [ownView, setOwnView] = React.useState(isView(props.defaultView) ? props.defaultView : "month");
  const chosen = isView(props.view) ? props.view : ownView;
  const narrow = !useBreakpoint("sm", {
    serverValue: true
  });
  const view = narrow && chosen !== "day" ? "agenda" : chosen;
  const hours = view === "week" || view === "day";
  const setView = (v) => {
    if (props.view === void 0) setOwnView(v);
    if (props.onViewChange) props.onViewChange(v);
  };
  const list = React.useMemo(() => toShown(props.events), [props.events]);
  const max = Number.isFinite(props.maxPerDay) ? Math.max(1, Math.floor(props.maxPerDay)) : 3;
  const hydrated = React.useSyncExternalStore(noSubscribe, yes, no);
  React.useEffect(() => {
    if (!fromServer.current) return;
    fromServer.current = false;
    if (!controlledMonth && !sameMonth(ownMonth, /* @__PURE__ */ new Date())) showMonth(/* @__PURE__ */ new Date());
  });
  const marked = hydrated ? today : null;
  const [chosenDay, setFocus] = React.useState(() => props.defaultMonth && isValid(props.defaultMonth) ? day(props.defaultMonth) : null);
  const focus = chosenDay ?? (marked && sameMonth(marked, month) ? marked : month);
  const monthTime = month.getTime();
  const [focusMonth, setFocusMonth] = React.useState(monthTime);
  if (focusMonth !== monthTime) {
    setFocusMonth(monthTime);
    if (chosenDay && !sameMonth(chosenDay, month)) setFocus(null);
  }
  const grid = React.useRef(null);
  const wantFocus = React.useRef(false);
  React.useEffect(() => {
    if (!wantFocus.current || !grid.current) return;
    const cell = grid.current.querySelector('td[data-date="' + iso(focus) + '"]');
    if (!cell) return;
    wantFocus.current = false;
    cell.focus();
  });
  const step = view === "week" ? 7 : 1;
  const go = (n) => {
    setFocus(n);
    if (!sameMonth(n, month)) showMonth(n);
  };
  const move = (d) => {
    setFocus(d);
    if (!sameMonth(d, month)) showMonth(d);
    wantFocus.current = true;
  };
  const movable = !!props.onEventMove;
  const [drag, setDrag] = React.useState(null);
  const [ghost, setGhost] = React.useState(null);
  const drawn = React.useMemo(() => drag ? list.map((x) => x.e.id === drag.id ? {
    ...x,
    from: new Date(drag.from),
    to: new Date(drag.to)
  } : x).sort(byStart) : list, [list, drag]);
  const dragged = React.useRef(false);
  const wantEvent = React.useRef(null);
  React.useEffect(() => {
    const w = wantEvent.current;
    if (!w || !grid.current) return;
    const cell_0 = grid.current.querySelector('td[data-date="' + w.day + '"]');
    const b = cell_0 && cell_0.querySelector('[data-event-id="' + CSS.escape(w.id) + '"]');
    if (b) b.focus();
    else if (props.events !== w.events && cell_0) cell_0.focus();
    else return;
    wantEvent.current = null;
  });
  const change = (x_0, from, to) => {
    if (!props.onEventMove || from.getTime() === x_0.from.getTime() && to.getTime() === x_0.to.getTime()) return;
    props.onEventMove(x_0.e, {
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
  const onPointerDown = (e) => {
    dragged.current = false;
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;
    const t = e.target, root = e.currentTarget, x0 = e.clientX, y0 = e.clientY;
    const startCell = t.closest("td[data-date]"), startDay = startCell && when(startCell.dataset.date);
    if (!startCell || !startDay) return;
    const handle = t.closest("[data-resize]"), id = handle ? handle.dataset.resize : t.closest("[data-event-id]")?.dataset.eventId;
    const x_1 = movable && e.pointerType !== "touch" && id ? list.find((s_0) => s_0.e.id === id) : void 0;
    if (!x_1 && (id || t.closest("button") || !props.onSlotSelect)) return;
    const inHours = hours && !!t.closest(".srp-event-calendar__hours");
    const hourAt = (td, y) => {
      const r = td.querySelector(".srp-event-calendar__hours").getBoundingClientRect();
      return Math.min(24, Math.max(0, (y - r.top) / r.height * 24));
    };
    const cellAt = (cx, cy) => {
      const td_0 = document.elementFromPoint(cx, cy)?.closest("td[data-date]");
      return td_0 && root.contains(td_0) ? td_0 : null;
    };
    const h0 = inHours ? hourAt(startCell, y0) : 0;
    let moved = false, last = null, chosen_0 = null;
    const onMove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return;
      if (!x_1 && (!inHours || ev.pointerType === "touch")) return;
      moved = true;
      if (!x_1) {
        const h = hourAt(startCell, ev.clientY), a = Math.floor(Math.min(h0, h) * 4) / 4, b_0 = Math.ceil(Math.max(h0, h) * 4) / 4;
        chosen_0 = {
          day: startDay.getTime(),
          at: a,
          len: Math.max(0.25, b_0 - a)
        };
        setGhost(chosen_0);
        return;
      }
      const td_1 = cellAt(ev.clientX, ev.clientY), at = td_1 && when(td_1.dataset.date);
      if (!td_1 || !at) return;
      const quarter = (h_0) => Math.round(h_0 * 4) / 4;
      let from_0 = x_1.from, to_0 = x_1.to;
      if (handle) to_0 = new Date(Math.max(shift(at, 0, quarter(hourAt(td_1, ev.clientY)) * 60).getTime(), shift(x_1.from, 0, QUARTER).getTime()));
      else {
        const dd = daysBetween(startDay, at), dm = inHours && !x_1.allDay ? Math.round((quarter(hourAt(td_1, ev.clientY)) - quarter(h0)) * 60) : 0;
        from_0 = shift(x_1.from, dd, dm);
        to_0 = shift(x_1.to, dd, dm);
      }
      if (last && last.from === from_0.getTime() && last.to === to_0.getTime()) return;
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
      const pick = props.onSlotSelect;
      if (chosen_0) pick({
        start: shift(startDay, 0, chosen_0.at * 60),
        end: shift(startDay, 0, (chosen_0.at + chosen_0.len) * 60),
        allDay: false
      });
      else if (!moved) {
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
    if (e_0.altKey || e_0.ctrlKey || e_0.metaKey) return;
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
    const rtl = getComputedStyle(e_0.currentTarget).direction === "rtl";
    const id_0 = e_0.shiftKey && movable && !target.closest("[role=dialog]") ? target.dataset.eventId : void 0;
    const moving = id_0 ? list.find((x_2) => x_2.e.id === id_0) : void 0;
    const side = e_0.key === "ArrowLeft" ? rtl ? 1 : -1 : e_0.key === "ArrowRight" ? rtl ? -1 : 1 : 0, vert = e_0.key === "ArrowUp" ? -1 : e_0.key === "ArrowDown" ? 1 : 0;
    if (moving && (side || vert)) {
      e_0.preventDefault();
      const days = side + (hours ? 0 : vert * 7), minutes = hours && !moving.allDay ? vert * QUARTER : 0;
      if (!days && !minutes) return;
      const from_1 = shift(moving.from, days, minutes), landing = addDays(when(target.closest("td")?.dataset.date) || day(moving.from), daysBetween(moving.from, from_1));
      wantEvent.current = {
        id: moving.e.id,
        day: iso(landing),
        events: props.events
      };
      go(landing);
      change(moving, from_1, shift(moving.to, days, minutes));
      return;
    }
    if (target.tagName !== "TD") return;
    let n_0 = null;
    switch (e_0.key) {
      case "ArrowLeft":
        n_0 = addDays(focus, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        n_0 = addDays(focus, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        n_0 = addDays(focus, -7);
        break;
      case "ArrowDown":
        n_0 = addDays(focus, 7);
        break;
      case "Home":
        n_0 = startOfWeek(focus, ws);
        break;
      case "End":
        n_0 = addDays(startOfWeek(focus, ws), 6);
        break;
      // A page is the view's: a month, or in the week and day views a week or a day.
      case "PageUp":
        n_0 = hours ? addDays(focus, -step) : addMonths(focus, -1);
        break;
      case "PageDown":
        n_0 = hours ? addDays(focus, step) : addMonths(focus, 1);
        break;
      // Enter or Space on a day chooses it whole, for a new event.
      case "Enter":
      case " ":
        if (!props.onSlotSelect) return;
        e_0.preventDefault();
        props.onSlotSelect({
          start: focus,
          end: focus,
          allDay: true
        });
        return;
      default:
        return;
    }
    e_0.preventDefault();
    move(n_0);
  };
  const fmt = React.useMemo(() => formatsFor(locale), [locale]);
  const onEventClick = (ev_1) => {
    if (dragged.current) dragged.current = false;
    else if (props.onEventClick) props.onEventClick(ev_1);
  };
  const handlers = {
    keyDown: onKeyDown,
    pointerDown: onPointerDown,
    eventClick: onEventClick
  };
  const live = React.useRef(handlers);
  live.current = handlers;
  const on = React.useMemo(() => ({
    keyDown: (e_1) => live.current.keyDown(e_1),
    pointerDown: (e_2) => live.current.pointerDown(e_2),
    setFocus,
    eventClick: (e_3) => live.current.eventClick(e_3)
  }), []);
  const level = props.headingLevel && props.headingLevel >= 2 && props.headingLevel <= 6 ? props.headingLevel : 2;
  const H = "h" + level;
  const span = view === "week" ? Array.from({
    length: 7
  }, (_, i) => addDays(startOfWeek(focus, ws), i)) : view === "day" ? [focus] : [];
  const title = view === "week" && span[0] && span[6] ? fmt.range.formatRange(span[0], span[6]).replace(/\s/g, " ") : view === "day" ? fmt.full.format(focus) : fmt.title.format(month);
  const [now, setNow] = React.useState(() => /* @__PURE__ */ new Date());
  React.useEffect(() => {
    if (!hours) return;
    const t_0 = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), minuteTick);
    return () => window.clearInterval(t_0);
  }, [hours]);
  const zone = hydrated ? fmt.zone.formatToParts(now).find((x_3) => x_3.type === "timeZoneName")?.value ?? "" : "";
  const timedIn = (d_0) => onDay(list, d_0).filter((s_1) => !s_1.allDay);
  const scroller = React.useRef(null);
  const spanStart = span[0] ? span[0].getTime() : 0;
  const firstHour = Math.floor(Math.min(OPEN_AT, ...span.flatMap((d_1) => timedIn(d_1).map((s_2) => hourOf(s_2.from, d_1)))));
  useIsoLayoutEffect(() => {
    const n_1 = scroller.current, mark = n_1 && n_1.querySelector('[data-hour="' + firstHour + '"]'), pinned = n_1 && n_1.querySelector(".srp-event-calendar__pinned");
    if (!n_1 || !mark || !pinned) return;
    n_1.scrollTop += mark.getBoundingClientRect().top - pinned.getBoundingClientRect().bottom;
  }, [view, spanStart]);
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: rootRef, className: cn("srp-event-calendar", props.className), "data-component": "event-calendar", "data-view": view, "data-dragging": drag ? "" : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "srp-event-calendar__nav" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: () => {
    showMonth(today);
    setFocus(today);
  } }, sds.labels.goToToday), /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, label: view === "week" ? sds.labels.previousWeek : view === "day" ? sds.labels.previousDay : sds.labels.previousMonth, size: "sm", variant: "ghost", hideTitle: true, className: "srp-event-calendar__prev", onClick: () => hours ? go(addDays(focus, -step)) : showMonth(addMonths(month, -1)) }), /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, label: view === "week" ? sds.labels.nextWeek : view === "day" ? sds.labels.nextDay : sds.labels.nextMonth, size: "sm", variant: "ghost", hideTitle: true, className: "srp-event-calendar__next", onClick: () => hours ? go(addDays(focus, step)) : showMonth(addMonths(month, 1)) })), /* @__PURE__ */ React.createElement(H, { className: "srp-event-calendar__heading", id: titleId, lang, "aria-live": "polite", "data-month": iso(month) }, dir ? /* @__PURE__ */ React.createElement("span", { dir }, title) : title), narrow ? null : /* @__PURE__ */ React.createElement(SegmentedControl, { size: "sm", "aria-label": sds.labels.calendarView, value: chosen, onValueChange: (v_0) => setView(isView(v_0) ? v_0 : "month"), options: [{
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
  }] })), /* @__PURE__ */ React.createElement(Body, { view, month: monthTime, focus: focus.getTime(), marked: marked ? marked.getTime() : null, ws, list: drawn, max, fmt, locale, lang, dir, titleId, labels: sds.labels, level, zone, now: now.getTime(), movable, dragging: drag ? drag.id : null, ghost, grid, scroller, on }));
}
var EventCalendar = /* @__PURE__ */ named("EventCalendar", EventCalendarRender);
export {
  EventCalendar
};
//# sourceMappingURL=EventCalendar.js.map
