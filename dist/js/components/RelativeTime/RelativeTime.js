"use client";

// src/components/RelativeTime/RelativeTime.tsx
import { c as _c } from "../../internal/memoCache.js";
import { dateFormat, relativeFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { isoDate, toDay } from "../../internal/dates.js";
import { canonicalLocale, localeDir } from "../../internal/locale.js";
import { useLocale, useOwnLang } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { relativeTick } from "../../internal/timing.js";
var now = Date.now();
var listeners = /* @__PURE__ */ new Set();
var timer = null;
var tick = () => {
  now = Date.now();
  listeners.forEach((l) => l());
};
var onVisible = () => {
  if (document.visibilityState === "visible") tick();
};
function subscribe(cb) {
  listeners.add(cb);
  if (!timer) {
    timer = setInterval(tick, relativeTick);
    document.addEventListener("visibilitychange", onVisible);
    if (Date.now() - now > 1e3) tick();
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}
var getNow = () => {
  if (!timer && Date.now() - now > relativeTick) now = Date.now();
  return now;
};
var serverNow = -Infinity;
var getServerNow = () => {
  const t = Date.now();
  if (t - serverNow > 1e3 || t < serverNow) serverNow = t;
  return serverNow;
};
var UNITS = [
  // [unit, its length in seconds, use it while the gap is under this many seconds]
  ["second", 1, 45],
  ["minute", 60, 45 * 60],
  ["hour", 3600, 22 * 3600],
  ["day", 86400, 26 * 86400],
  ["month", 2629800, 320 * 86400],
  ["year", 31557600, Infinity]
];
var unit = (i) => UNITS[i] ?? ["year", 31557600, Infinity];
var dayOf = (date) => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? toDay(date) || /* @__PURE__ */ new Date(NaN) : null;
function relativeTime(date, now2, locale, options) {
  const day = dayOf(date);
  const t = (day || new Date(date)).getTime();
  if (!isFinite(t)) return "";
  const secs = (t - now2) / 1e3, abs = Math.abs(secs);
  const rtf = relativeFormat(locale ? canonicalLocale(locale) : void 0, {
    style: options?.format || "long",
    numeric: options?.numeric || "auto"
  });
  let i = UNITS.findIndex(([, , under]) => abs < under);
  if (day) i = Math.max(i, 3);
  if (i === 0) return rtf.format(secs < 0 ? -0 : 0, "second");
  if (options?.numeric !== "always" || day) {
    const a = new Date(t), b = new Date(now2);
    for (; i >= 3; i--) {
      let n = i === 3 ? Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 864e5) : i === 4 ? (a.getFullYear() - b.getFullYear()) * 12 + a.getMonth() - b.getMonth() : a.getFullYear() - b.getFullYear();
      if (i >= 4 && !day) {
        const cap = Math.max(1, Math.ceil(abs / unit(i)[1]));
        if (Math.abs(n) > cap) n = Math.sign(n) * cap;
      }
      if (n !== 0 || day && i === 3) return rtf.format(n === 0 && secs < 0 ? -0 : n, unit(i)[0]);
    }
  }
  return rtf.format(Math.round(secs / unit(i)[1]), unit(i)[0]);
}
function RelativeTimeRender(t0) {
  const $ = _c(9);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    date: 1,
    format: 1,
    numeric: 1,
    titleFormat: 1,
    absoluteAfter: 1,
    absoluteFormat: 1,
    locale: 1,
    className: 1
  });
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const current = React.useSyncExternalStore(subscribe, getNow, getServerNow);
  const day = dayOf(props.date);
  const d = day || new Date(props.date);
  const valid = isFinite(d.getTime());
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !valid) {
      warnOnce("relative-time-date", "RelativeTime: date " + JSON.stringify(String(props.date)) + ` isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, or a string Date can read, such as "2026-10-24T09:30:00Z".`);
    }
  }, [valid, props.date]);
  const gap = (d.getTime() - (day ? new Date(current).setHours(0, 0, 0, 0) : current)) / 864e5;
  const after = props.absoluteAfter ?? 7;
  const far = valid && after !== false && Math.abs(day ? Math.round(gap) : gap) > after;
  const text = !valid ? "" : far ? dateFormat(locale, props.absoluteFormat || {
    dateStyle: "medium"
  }).format(d) : relativeTime(day ? props.date : d, current, locale, {
    format: props.format,
    numeric: props.numeric
  });
  const title = !valid || props.titleFormat === false ? void 0 : dateFormat(locale, props.titleFormat || {
    dateStyle: "long",
    timeStyle: day ? void 0 : "short"
  }).format(d);
  const t1 = props.locale ? localeDir(props.locale) : void 0;
  const t2 = valid ? day ? isoDate(d) : d.toISOString() : void 0;
  const t3 = rest.title ?? title;
  const t4 = cn("srp-relative-time", props.className);
  let t5;
  if ($[0] !== lang || $[1] !== ref || $[2] !== rest || $[3] !== t1 || $[4] !== t2 || $[5] !== t3 || $[6] !== t4 || $[7] !== text) {
    t5 = /* @__PURE__ */ React.createElement("time", { lang, dir: t1, ...rest, ref, dateTime: t2, title: t3, className: t4, "data-component": "relative-time", suppressHydrationWarning: true }, text);
    $[0] = lang;
    $[1] = ref;
    $[2] = rest;
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
    $[7] = text;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  return t5;
}
var RelativeTime = /* @__PURE__ */ named("RelativeTime", RelativeTimeRender);
export {
  RelativeTime,
  relativeTime
};
//# sourceMappingURL=RelativeTime.js.map
