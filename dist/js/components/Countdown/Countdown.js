"use client";

// src/components/Countdown/Countdown.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { canonicalLocale } from "../../internal/locale.js";
import { useLocale, useOwnLang } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { countdownTick } from "../../internal/timing.js";
var DEFAULT_STEPS = [3600, 1800, 600, 300, 120, 60, 30, 10];
var now = Date.now();
var read = false;
var listeners = /* @__PURE__ */ new Set();
var timer = null;
var tick = () => {
  now = Date.now();
  listeners.forEach((l) => l());
};
function subscribe(cb) {
  listeners.add(cb);
  if (!timer) {
    tick();
    timer = setInterval(tick, countdownTick);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
var getNow = () => {
  if (!timer && !read) {
    now = Date.now();
    read = true;
    queueMicrotask(() => {
      read = false;
    });
  }
  return now;
};
var still = () => () => {
};
var serverNow = -Infinity;
var getServerNow = () => {
  const t = Date.now();
  if (t - serverNow > 1e3 || t < serverNow) serverNow = t;
  return serverNow;
};
var parts = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  return [[Math.floor(s / 86400), "day"], [Math.floor(s / 3600) % 24, "hour"], [Math.floor(s / 60) % 60, "minute"], [s % 60, "second"]];
};
var loc = (locale) => locale ? canonicalLocale(locale) : void 0;
function countdownClock(seconds, locale) {
  const s = Math.max(0, Math.round(seconds)), l = loc(locale);
  const one = new Intl.NumberFormat(l, { useGrouping: false }), two = new Intl.NumberFormat(l, { minimumIntegerDigits: 2, useGrouping: false });
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return h ? `${one.format(h)}:${two.format(m)}:${two.format(sec)}` : `${one.format(m)}:${two.format(sec)}`;
}
function countdownWords(seconds, locale) {
  const l = loc(locale);
  const said = parts(seconds).filter(([n]) => n > 0).map(([n, unit]) => new Intl.NumberFormat(l, { style: "unit", unit, unitDisplay: "long" }).format(n));
  return said.length ? new Intl.ListFormat(l, { type: "unit", style: "long" }).format(said) : new Intl.NumberFormat(l, { style: "unit", unit: "second", unitDisplay: "long" }).format(0);
}
var Countdown = /* @__PURE__ */ component("Countdown", function Countdown2(props, ref) {
  const rest = omit(props, { to: 1, seconds: 1, label: 1, format: 1, announceAt: 1, endText: 1, onEnd: 1, locale: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const own = props.seconds === void 0;
  const current = React.useSyncExternalStore(own ? subscribe : still, getNow, getServerNow);
  const end = own && props.to !== void 0 ? new Date(props.to).getTime() : NaN;
  const valid = own ? isFinite(end) : isFinite(props.seconds);
  const left = !valid ? 0 : own ? Math.max(0, Math.ceil((end - current) / 1e3)) : Math.max(0, Math.round(props.seconds));
  const ended = valid && left === 0;
  const words = countdownWords(left, locale);
  const was = React.useRef(null);
  const onEnd = React.useRef(props.onEnd);
  onEnd.current = props.onEnd;
  const { label, endText } = props;
  const steps = props.announceAt || DEFAULT_STEPS;
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !valid) warnOnce("countdown-to", own ? "Countdown: to " + JSON.stringify(String(props.to)) + ` isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, or a string Date can read, such as "2026-11-14T18:00:00Z", or the time left as seconds.` : "Countdown: seconds " + JSON.stringify(String(props.seconds)) + " isn't a number, so it shows nothing.");
  }, [valid, own, props.to, props.seconds]);
  React.useEffect(() => {
    if (!valid) return;
    const before = was.current;
    was.current = left;
    if (left === 0) {
      if (before !== 0) {
        onEnd.current?.();
        if (before !== null) announce(endText || `${label}: ${countdownWords(0, locale)}`);
      }
      return;
    }
    if (before === null || before <= left) return;
    const crossed = steps.filter((t) => t < before && t >= left);
    if (crossed.length) announce(`${label}: ${countdownWords(Math.min(...crossed), locale)}`);
  }, [left, valid, label, endText, locale, steps]);
  const text = !valid ? "" : ended && endText ? endText : props.format === "words" ? words : countdownClock(left, locale);
  return /* @__PURE__ */ React.createElement(
    "time",
    {
      lang,
      ...rest,
      ref,
      role: "timer",
      "aria-label": valid ? `${label}: ${ended && endText ? endText : words}` : label,
      dateTime: valid ? `PT${left}S` : void 0,
      className: cn("dk-countdown", ended && "dk-countdown--ended", props.className),
      "data-component": "countdown",
      suppressHydrationWarning: true
    },
    text
  );
});
export {
  Countdown,
  countdownClock,
  countdownWords
};
//# sourceMappingURL=Countdown.js.map
