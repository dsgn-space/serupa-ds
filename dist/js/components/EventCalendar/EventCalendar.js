"use client";

// src/components/EventCalendar/EventCalendar.tsx
import * as React from "react";
import { cn, domId, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { useBreakpoint } from "../../internal/media.js";
import { component } from "../../internal/component.js";
import { addDays, addMonths, compare, day, firstDayOfWeek, isValid, sameDay, sameMonth, startOfMonth, startOfWeek } from "../../internal/dates.js";
import { useLocale, useOwnLang, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { minuteTick } from "../../internal/timing.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Popover } from "../Popover/Popover.js";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl.js";
import { en as CalendarWords } from "../Calendar/labels.js";
import { en as EventCalendarWords } from "./labels.js";
var words = /* @__PURE__ */ Object.assign({}, EventCalendarWords, CalendarWords);
function numericHour(f) {
  return { format: (d) => f.formatToParts(d).map((x) => x.type === "hour" ? x.value.replace(/^0(?=\d)/, "") : x.value).join("") };
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
    out.push({ e, from, to: to < from ? from : to, allDay: !!e.allDay || typeof e.start === "string" && DAY_ONLY.test(e.start) });
  }
  return out.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.from.getTime() - b.from.getTime() || a.e.title.localeCompare(b.e.title));
}
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
    const p = { s, at, len: end - at, lane, lanes: 1 };
    run.push(p);
    out.push(p);
    runEnd = Math.max(runEnd, end);
  }
  close();
  return out;
}
var HOURS = /* @__PURE__ */ Array.from({ length: 24 }, (_, h) => h);
var OPEN_AT = 8;
var iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
var EventCalendar = /* @__PURE__ */ component("EventCalendar", function EventCalendar2(props, ref) {
  const sds = useSettings(words);
  const rootRef = useServerStyles(ref);
  const rest = omit(props, { events: 1, onEventClick: 1, month: 1, defaultMonth: 1, onMonthChange: 1, view: 1, defaultView: 1, onViewChange: 1, maxPerDay: 1, locale: 1, weekStartsOn: 1, headingLevel: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const ws = props.weekStartsOn != null ? (Math.floor(props.weekStartsOn) % 7 + 7) % 7 : firstDayOfWeek(locale);
  const today = day(/* @__PURE__ */ new Date());
  const controlledMonth = props.month !== void 0;
  const titleId = domId("dk-evc", React.useId()) + "-title";
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
  const narrow = !useBreakpoint("sm", { serverValue: true });
  const view = narrow && chosen !== "day" ? "agenda" : chosen;
  const hours = view === "week" || view === "day";
  const setView = (v) => {
    if (props.view === void 0) setOwnView(v);
    if (props.onViewChange) props.onViewChange(v);
  };
  const list = React.useMemo(() => toShown(props.events), [props.events]);
  const max = Math.max(1, Math.floor(props.maxPerDay ?? 3));
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
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target;
    if (e.key === "Escape" && target.tagName === "BUTTON" && !target.closest("[role=dialog]")) {
      const cell = target.closest("td");
      if (cell) {
        e.preventDefault();
        cell.focus();
      }
      return;
    }
    if (target.tagName !== "TD") return;
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
      // A page is the view's: a month, or in the week and day views a week or a day.
      case "PageUp":
        n = hours ? addDays(focus, -step) : addMonths(focus, -1);
        break;
      case "PageDown":
        n = hours ? addDays(focus, step) : addMonths(focus, 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    move(n);
  };
  const fmt = React.useMemo(() => ({
    title: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", month: "long", year: "numeric" }),
    full: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long" }),
    day: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", month: "long", day: "numeric" }),
    time: numericHour(new Intl.DateTimeFormat(locale, { numberingSystem: "latn", hour: "numeric", minute: "2-digit" })),
    hour: numericHour(new Intl.DateTimeFormat(locale, { numberingSystem: "latn", hour: "numeric" })),
    range: new Intl.DateTimeFormat(locale, { calendar: "gregory", numberingSystem: "latn", month: "long", day: "numeric", year: "numeric" }),
    zone: new Intl.DateTimeFormat(locale, { timeZoneName: "short" })
  }), [locale]);
  const level = props.headingLevel && props.headingLevel >= 2 && props.headingLevel <= 6 ? props.headingLevel : 2;
  const H = "h" + level, H2 = "h" + Math.min(6, level + 1);
  const timeOf = (s) => {
    if (s.allDay) return sds.labels.allDay;
    const a = fmt.time.format(s.from), b = fmt.time.format(s.to);
    if (sameDay(s.from, s.to)) return s.to.getTime() === s.from.getTime() ? a : sds.labels.eventTime(a, b);
    return sds.labels.eventTime(fmt.full.format(s.from) + " " + a, fmt.full.format(s.to) + " " + b);
  };
  const shownTime = (s, detail) => s.allDay && !detail ? "" : detail ? timeOf(s) : fmt.time.format(s.from);
  const nameOf = (s, day2, detail) => [[shownTime(s, detail), s.e.title].filter(Boolean).join(" "), fmt.day.format(day2), detail || timeOf(s) === shownTime(s, detail) ? "" : timeOf(s), s.e.repeating ? sds.labels.repeats : ""].filter(Boolean).join(", ");
  const eventButton = (s, day2, tab, detail) => /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      tabIndex: tab,
      "aria-label": nameOf(s, day2, detail),
      "data-event-id": s.e.id,
      onClick: () => props.onEventClick?.(s.e),
      className: cn("dk-event-calendar__event", "dk-event-calendar__event--" + (s.e.tone || "primary"), s.allDay && "dk-event-calendar__event--all-day")
    },
    s.allDay && !detail ? null : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "dk-event-calendar__time" }, shownTime(s, detail)), " "),
    /* @__PURE__ */ React.createElement("span", { className: "dk-event-calendar__title" }, s.e.title),
    s.e.repeating ? /* @__PURE__ */ React.createElement("span", { className: "dk-event-calendar__repeat", "aria-hidden": true }, "\u21BB") : null
  );
  const first = startOfWeek(month, ws);
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const row = Array.from({ length: 7 }, (_, i) => addDays(first, w * 7 + i));
    if (w > 0 && row[0] && !sameMonth(row[0], month)) break;
    weeks.push(row);
  }
  const stop = weeks.some((r) => r.some((d) => sameDay(d, focus))) ? focus : marked && sameMonth(marked, month) ? marked : month;
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1));
  const span = view === "week" ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(focus, ws), i)) : view === "day" ? [focus] : [];
  const title = view === "week" && span[0] && span[6] ? fmt.range.formatRange(span[0], span[6]).replace(/\s/g, " ") : view === "day" ? fmt.full.format(focus) : fmt.title.format(month);
  const [now, setNow] = React.useState(() => /* @__PURE__ */ new Date());
  React.useEffect(() => {
    if (!hours) return;
    const t = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), minuteTick);
    return () => window.clearInterval(t);
  }, [hours]);
  const zone = hydrated ? fmt.zone.formatToParts(now).find((x) => x.type === "timeZoneName")?.value ?? "" : "";
  const timedIn = (d) => onDay(list, d).filter((s) => !s.allDay);
  const allDayRows = Math.max(0, ...span.map((d) => onDay(list, d).filter((s) => s.allDay).length));
  const scroller = React.useRef(null);
  const spanStart = span[0] ? span[0].getTime() : 0;
  const firstHour = Math.floor(Math.min(OPEN_AT, ...span.flatMap((d) => timedIn(d).map((s) => hourOf(s.from, d)))));
  useIsoLayoutEffect(() => {
    const n = scroller.current, mark = n && n.querySelector('[data-hour="' + firstHour + '"]'), pinned = n && n.querySelector(".dk-event-calendar__pinned");
    if (!n || !mark || !pinned) return;
    n.scrollTop += mark.getBoundingClientRect().top - pinned.getBoundingClientRect().bottom;
  }, [view, spanStart]);
  const busy = view === "agenda" ? days.map((d) => [d, onDay(list, d)]).filter(([, l]) => l.length) : [];
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: rootRef, className: cn("dk-event-calendar", props.className), "data-component": "event-calendar", "data-view": view }, /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__nav" }, /* @__PURE__ */ React.createElement(Button, { variant: "outline", size: "sm", onClick: () => {
    showMonth(today);
    setFocus(today);
  } }, sds.labels.goToToday), /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronLeft,
      label: view === "week" ? sds.labels.previousWeek : view === "day" ? sds.labels.previousDay : sds.labels.previousMonth,
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      className: "dk-event-calendar__prev",
      onClick: () => hours ? go(addDays(focus, -step)) : showMonth(addMonths(month, -1))
    }
  ), /* @__PURE__ */ React.createElement(
    IconButton,
    {
      icon: icons.ChevronRight,
      label: view === "week" ? sds.labels.nextWeek : view === "day" ? sds.labels.nextDay : sds.labels.nextMonth,
      size: "sm",
      variant: "ghost",
      hideTitle: true,
      className: "dk-event-calendar__next",
      onClick: () => hours ? go(addDays(focus, step)) : showMonth(addMonths(month, 1))
    }
  )), /* @__PURE__ */ React.createElement(H, { className: "dk-event-calendar__heading", id: titleId, lang, "aria-live": "polite", "data-month": iso(month) }, title), narrow ? null : /* @__PURE__ */ React.createElement(
    SegmentedControl,
    {
      size: "sm",
      "aria-label": sds.labels.calendarView,
      value: chosen,
      onValueChange: (v) => setView(isView(v) ? v : "month"),
      options: [{ value: "month", label: sds.labels.monthView }, { value: "week", label: sds.labels.weekView }, { value: "day", label: sds.labels.dayView }, { value: "agenda", label: sds.labels.agendaView }]
    }
  )), view === "month" ? /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "dk-event-calendar__grid", "aria-labelledby": titleId, onKeyDown }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, (weeks[0] ?? []).map((d) => /* @__PURE__ */ React.createElement("th", { key: d.getDay(), scope: "col", abbr: fmt.long.format(d) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d)), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, fmt.long.format(d)))))), /* @__PURE__ */ React.createElement("tbody", null, weeks.map((row) => /* @__PURE__ */ React.createElement("tr", { key: row[0]?.getTime() }, row.map((d) => {
    const mine = sameMonth(d, month) ? onDay(list, d) : [], here = sameDay(d, stop), isToday = marked !== null && sameDay(d, marked);
    const fits = mine.length > max ? mine.slice(0, max - 1) : mine, more = mine.length - fits.length;
    return /* @__PURE__ */ React.createElement(
      "td",
      {
        key: d.getTime(),
        role: "gridcell",
        tabIndex: here ? 0 : -1,
        "aria-current": isToday ? "date" : void 0,
        "data-date": iso(d),
        className: cn("dk-event-calendar__day", !sameMonth(d, month) && "dk-event-calendar__day--outside", isToday && "dk-event-calendar__day--today"),
        onFocus: (e) => {
          if (e.target === e.currentTarget && !here) setFocus(d);
        }
      },
      /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, fmt.full.format(d) + ", " + sds.labels.eventCount(mine.length, displayNumber(mine.length, locale))),
      /* @__PURE__ */ React.createElement("span", { className: "dk-event-calendar__date", "aria-hidden": true }, d.getDate()),
      fits.length ? /* @__PURE__ */ React.createElement("ul", { className: "dk-event-calendar__events", role: "list" }, fits.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.e.id }, eventButton(s, d, here ? 0 : -1, false)))) : null,
      more > 0 ? /* @__PURE__ */ React.createElement(Popover, { title: fmt.full.format(d), placement: "bottom-start", trigger: /* @__PURE__ */ React.createElement("button", { type: "button", tabIndex: here ? 0 : -1, className: "dk-event-calendar__more" }, sds.labels.moreEvents(more, displayNumber(more, locale))) }, /* @__PURE__ */ React.createElement("ul", { className: "dk-event-calendar__events dk-event-calendar__events--all", role: "list" }, mine.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.e.id }, eventButton(s, d, 0, true))))) : null
    );
  }))))) : hours ? (
    /* The days' hours: a grid of one row, a cell a day, so the keys, the names and the Tab stop are the month's.
       The weekday names and the all-day events stay pinned at the top while the hours scroll under them. The
       hour scale and the time zone are drawn beside, hidden from screen readers: each event says its time. */
    /* @__PURE__ */ React.createElement("div", { ref: scroller, className: "dk-event-calendar__scroll", style: { "--dk-evc-all-day": allDayRows } }, /* @__PURE__ */ React.createElement("table", { ref: grid, role: "grid", lang, className: "dk-event-calendar__grid dk-event-calendar__hours-grid", "aria-labelledby": titleId, onKeyDown, "data-days": span.length }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "dk-event-calendar__zone" }, zone), span.map((d) => /* @__PURE__ */ React.createElement("th", { key: d.getTime(), scope: "col", className: cn(marked && sameDay(d, marked) && "dk-event-calendar__head--today") }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, fmt.short.format(d), " ", /* @__PURE__ */ React.createElement("span", { className: "dk-event-calendar__head-date" }, d.getDate())), /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, fmt.full.format(d)))))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { "aria-hidden": true, className: "dk-event-calendar__scale" }, /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__pinned" }), /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__hours" }, HOURS.map((h) => /* @__PURE__ */ React.createElement("span", { key: h, "data-hour": h, style: { "--dk-evc-at": h } }, h ? fmt.hour.format(new Date(2e3, 0, 1, h)) : "")))), span.map((d) => {
      const mine = onDay(list, d), whole = mine.filter((s) => s.allDay), here = sameDay(d, focus), isToday = marked !== null && sameDay(d, marked);
      return /* @__PURE__ */ React.createElement(
        "td",
        {
          key: d.getTime(),
          role: "gridcell",
          tabIndex: here ? 0 : -1,
          "aria-current": isToday ? "date" : void 0,
          "data-date": iso(d),
          className: cn("dk-event-calendar__day dk-event-calendar__column", isToday && "dk-event-calendar__day--today"),
          onFocus: (e) => {
            if (e.target === e.currentTarget && !here) setFocus(d);
          }
        },
        /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, fmt.full.format(d) + ", " + sds.labels.eventCount(mine.length, displayNumber(mine.length, locale))),
        /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__pinned" }, whole.length ? /* @__PURE__ */ React.createElement("ul", { className: "dk-event-calendar__events", role: "list" }, whole.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.e.id }, eventButton(s, d, here ? 0 : -1, false)))) : null),
        /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__hours" }, isToday ? /* @__PURE__ */ React.createElement("div", { className: "dk-event-calendar__now", "aria-hidden": true, style: { "--dk-evc-at": hourOf(now, d) } }) : null, /* @__PURE__ */ React.createElement("ul", { className: "dk-event-calendar__timed", role: "list" }, place(mine.filter((s) => !s.allDay), d).map((p) => /* @__PURE__ */ React.createElement("li", { key: p.s.e.id, "data-short": p.len < 0.75 || void 0, style: { "--dk-evc-at": p.at, "--dk-evc-for": p.len, "--dk-evc-lane": p.lane, "--dk-evc-lanes": p.lanes } }, eventButton(p.s, d, here ? 0 : -1, false)))))
      );
    })))))
  ) : busy.length ? /* @__PURE__ */ React.createElement("ol", { className: "dk-event-calendar__agenda", role: "list", "aria-labelledby": titleId, lang }, busy.map(([d, l]) => /* @__PURE__ */ React.createElement("li", { key: d.getTime(), className: cn("dk-event-calendar__agenda-day", marked && sameDay(d, marked) && "dk-event-calendar__agenda-day--today"), "aria-current": marked && sameDay(d, marked) ? "date" : void 0 }, /* @__PURE__ */ React.createElement(H2, { className: "dk-event-calendar__agenda-date" }, fmt.full.format(d)), /* @__PURE__ */ React.createElement("ul", { className: "dk-event-calendar__events", role: "list" }, l.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.e.id }, eventButton(s, d, 0, true))))))) : /* @__PURE__ */ React.createElement("p", { className: "dk-event-calendar__empty" }, sds.labels.noEvents));
});
export {
  EventCalendar
};
//# sourceMappingURL=EventCalendar.js.map
