"use client";

// src/components/Countdown/Countdown.tsx
import { c as _c } from "../../internal/memoCache.js";
import { listFormat, numberFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, omit, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { announce } from "../../internal/announce.js";
import { canonicalLocale, localeDir } from "../../internal/locale.js";
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
  const one = numberFormat(l, {
    useGrouping: false
  }), two = numberFormat(l, {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return h ? `${one.format(h)}:${two.format(m)}:${two.format(sec)}` : `${one.format(m)}:${two.format(sec)}`;
}
function countdownWords(seconds, locale) {
  return wordsOf(seconds, locale, false);
}
function wordsOf(seconds, locale, together) {
  const l = loc(locale);
  const unitOf = (n, unit) => {
    const s = numberFormat(l, {
      style: "unit",
      unit,
      unitDisplay: "long"
    }).format(n);
    return together ? s.replace(/ /g, "\xA0") : s;
  };
  const said = parts(seconds).filter(([n]) => n > 0).map(([n, unit]) => unitOf(n, unit));
  return said.length ? listFormat(l, {
    type: "unit",
    style: "long"
  }).format(said) : unitOf(0, "second");
}
function CountdownRender(t0) {
  const $ = _c(12);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    to: 1,
    seconds: 1,
    label: 1,
    format: 1,
    announceAt: 1,
    endText: 1,
    onEnd: 1,
    locale: 1,
    className: 1
  });
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const own = props.seconds === void 0;
  const current = React.useSyncExternalStore(own ? subscribe : still, getNow, getServerNow);
  const end = own && props.to !== void 0 ? new Date(props.to).getTime() : NaN;
  const valid = own ? isFinite(end) : isFinite(props.seconds);
  const left = !valid ? 0 : own ? Math.max(0, Math.ceil((end - current) / 1e3)) : Math.max(0, Math.round(props.seconds));
  const ended = valid && left === 0;
  let t1;
  if ($[0] !== left || $[1] !== locale) {
    t1 = countdownWords(left, locale);
    $[0] = left;
    $[1] = locale;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const words = t1;
  const was = React.useRef(null);
  const onEnd = useLatest(props.onEnd);
  const {
    label,
    endText
  } = props;
  const steps = props.announceAt || DEFAULT_STEPS;
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !valid) {
      warnOnce("countdown-to", own ? "Countdown: to " + JSON.stringify(String(props.to)) + ` isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, or a string Date can read, such as "2026-11-14T18:00:00Z", or the time left as seconds.` : "Countdown: seconds " + JSON.stringify(String(props.seconds)) + " isn't a number, so it shows nothing.");
    }
  }, [valid, own, props.to, props.seconds]);
  React.useEffect(() => {
    if (!valid) {
      return;
    }
    const before = was.current;
    was.current = left;
    if (left === 0) {
      if (before !== 0) {
        onEnd.current?.();
        if (before !== null) {
          announce(endText || `${label}: ${countdownWords(0, locale)}`);
        }
      }
      return;
    }
    if (before === null || before <= left) {
      return;
    }
    const crossed = steps.filter((t) => t < before && t >= left);
    if (crossed.length) {
      announce(`${label}: ${countdownWords(Math.min(...crossed), locale)}`);
    }
  }, [left, valid, label, endText, locale, steps, onEnd]);
  const text = !valid ? "" : ended && endText ? endText : props.format === "words" ? wordsOf(left, locale, true) : countdownClock(left, locale);
  const wraps = valid && (ended && !!endText || props.format === "words");
  const t2 = props.locale ? localeDir(props.locale) : void 0;
  const t3 = "timer";
  const t4 = valid ? `${label}: ${ended && endText ? endText : words}` : label;
  const t5 = valid ? `PT${left}S` : void 0;
  const t6 = cn("srp-countdown", wraps && "srp-countdown--wraps", ended && "srp-countdown--ended", props.className);
  let t7;
  if ($[3] !== lang || $[4] !== ref || $[5] !== rest || $[6] !== t2 || $[7] !== t4 || $[8] !== t5 || $[9] !== t6 || $[10] !== text) {
    t7 = /* @__PURE__ */ React.createElement("time", { lang, dir: t2, ...rest, ref, role: t3, "aria-label": t4, dateTime: t5, className: t6, "data-component": "countdown", suppressHydrationWarning: true }, text);
    $[3] = lang;
    $[4] = ref;
    $[5] = rest;
    $[6] = t2;
    $[7] = t4;
    $[8] = t5;
    $[9] = t6;
    $[10] = text;
    $[11] = t7;
  } else {
    t7 = $[11];
  }
  return t7;
}
var Countdown = /* @__PURE__ */ named("Countdown", CountdownRender);
export {
  Countdown,
  countdownClock,
  countdownWords
};
//# sourceMappingURL=Countdown.js.map
