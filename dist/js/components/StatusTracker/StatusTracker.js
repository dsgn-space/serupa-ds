"use client";

// src/components/StatusTracker/StatusTracker.tsx
import * as React from "react";
import { cn, omit, setRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { en as words } from "./labels.js";
var STATES = ["up", "degraded", "down", "none"];
var toDate = (d) => {
  if (d instanceof Date) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d);
};
var StatusTracker = /* @__PURE__ */ component("StatusTracker", function StatusTracker2(props, ref) {
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { days: 1, label: 1, summary: 1, legend: 1, className: 1 });
  const days = props.days || [];
  const [at, setAtIndex] = React.useState(null);
  const setAt = (i) => setAtIndex(i === days.length - 1 ? null : i);
  const [shown, setShown] = React.useState(null);
  const list = React.useRef(null);
  const word = (s) => s === "up" ? L.statusUp : s === "degraded" ? L.statusDegraded : s === "down" ? L.statusDown : L.statusNone;
  const dateFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);
  const say = (d) => L.statusDay(dateFmt.format(toDate(d.date)), word(d.state)) + (d.note ? ". " + d.note : "");
  const known = days.filter((d) => d.state !== "none");
  const upShare = known.length ? known.filter((d) => d.state === "up").length / known.length : 1;
  const incidents = known.filter((d) => d.state !== "up").length;
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(upShare);
  const summary = props.summary === void 0 ? L.statusSummary(percent, days.length, incidents) : props.summary;
  const current = Math.min(Math.max(at ?? days.length - 1, 0), days.length - 1);
  const move = (i) => {
    const n = Math.min(Math.max(i, 0), days.length - 1);
    setAt(n);
    setShown(n);
    const el = list.current && list.current.children[n];
    if (el instanceof HTMLElement) el.focus();
  };
  const onKeyDown = (e) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const k = e.key, next = rtl ? "ArrowLeft" : "ArrowRight", prev = rtl ? "ArrowRight" : "ArrowLeft";
    if (k === next) move(current + 1);
    else if (k === prev) move(current - 1);
    else if (k === "Home") move(0);
    else if (k === "End") move(days.length - 1);
    else if (k === "Escape") {
      setShown(null);
      return;
    } else return;
    e.preventDefault();
  };
  const listEvents = {
    onKeyDown,
    onMouseLeave: () => setShown(null),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setShown(null);
    }
  };
  React.useEffect(() => {
    const el = list.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = getComputedStyle(el).direction === "rtl" ? -el.scrollWidth : el.scrollWidth;
  }, [days.length]);
  const caption = shown != null && days[shown] ? say(days[shown]) : null;
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: (n) => setRef(ref, n), className: cn("dk-status-tracker", props.className), "data-component": "status-tracker" }, /* @__PURE__ */ React.createElement("ol", { className: "dk-status-tracker__days", role: "list", ref: list, "aria-label": props.label, ...listEvents }, days.map((d, i) => /* @__PURE__ */ React.createElement(
    "li",
    {
      key: i,
      className: "dk-status-tracker__day",
      "data-state": d.state,
      "aria-label": say(d),
      ...{ tabIndex: i === current ? 0 : -1 },
      onFocus: () => {
        setAt(i);
        setShown(i);
      },
      onMouseEnter: () => setShown(i)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "dk-status-tracker__caption", "aria-hidden": true }, caption || "\xA0"), summary != null ? /* @__PURE__ */ React.createElement("p", { className: "dk-status-tracker__summary" }, summary) : null, props.legend !== false ? /* @__PURE__ */ React.createElement("ul", { className: "dk-status-tracker__legend", role: "list" }, STATES.map((s) => /* @__PURE__ */ React.createElement("li", { key: s, className: "dk-status-tracker__key", "data-state": s }, /* @__PURE__ */ React.createElement("span", { className: "dk-status-tracker__swatch", "aria-hidden": true }), word(s)))) : null);
});
export {
  StatusTracker
};
//# sourceMappingURL=StatusTracker.js.map
