"use client";

// src/components/Duration/Duration.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit, oneOf } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { canonicalLocale, localeDir } from "../../internal/locale.js";
import { useLocale, useOwnLang } from "../../internal/provider.js";
var UNITS = ["day", "hour", "minute", "second"];
var SECONDS = {
  millisecond: 1e-3,
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400
};
var ISO = {
  day: "D",
  hour: "H",
  minute: "M",
  second: "S"
};
function split(value, o) {
  const unit = o.unit && o.unit in SECONDS ? o.unit : "second";
  const digital = o.display === "digital";
  const smallest = oneOf(UNITS, o.smallest, unit === "millisecond" ? "second" : unit === "hour" || unit === "day" ? "minute" : unit);
  const largest = oneOf(UNITS, o.largest, digital ? "hour" : "day");
  const from = UNITS.indexOf(largest), to = Math.max(from, UNITS.indexOf(smallest));
  let left = Math.round(Math.abs(value) * SECONDS[unit] / SECONDS[UNITS[to]]) * SECONDS[UNITS[to]];
  const out = [];
  for (let i = from; i <= to; i++) {
    const u = UNITS[i], n = Math.floor(left / SECONDS[u]);
    left -= n * SECONDS[u];
    out.push([n, u]);
  }
  if (digital && !o.largest && out.length > 2 && out[0][0] === 0) out.shift();
  return out;
}
function formatDuration(value, locale, options = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const l = locale ? canonicalLocale(locale) : void 0;
  const parts = split(value, options);
  const display = oneOf(["long", "short", "narrow", "digital"], options.display, "short");
  if (display === "digital") {
    const one = new Intl.NumberFormat(l, {
      useGrouping: false
    }), two = new Intl.NumberFormat(l, {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    return parts.map(([n], i) => (i ? two : one).format(n)).join(":");
  }
  const word = (n, u) => new Intl.NumberFormat(l, {
    style: "unit",
    unit: u,
    unitDisplay: display
  }).format(n);
  const said = parts.filter(([n]) => n > 0).map(([n, u]) => word(n, u));
  const last = parts[parts.length - 1];
  return said.length ? new Intl.ListFormat(l, {
    type: "unit",
    style: display
  }).format(said) : word(0, last[1]);
}
function isoDuration(value, options = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const parts = split(value, {
    ...options,
    largest: "day"
  }).filter(([n]) => n > 0);
  const days = parts.filter(([, u]) => u === "day").map(([n]) => n + "D").join("");
  const time = parts.filter(([, u]) => u !== "day").map(([n, u]) => n + ISO[u]).join("");
  return "P" + days + (time ? "T" + time : days ? "" : "T0S");
}
function DurationRender(t0) {
  const $ = _c(8);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    value: 1,
    unit: 1,
    display: 1,
    smallest: 1,
    largest: 1,
    locale: 1,
    className: 1
  });
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const o = {
    unit: props.unit,
    display: props.display,
    smallest: props.smallest,
    largest: props.largest
  };
  const text = formatDuration(props.value, locale, o);
  const digital = props.display === "digital" && !!text;
  const shown = digital ? text : text.replace(/(?<=\d) /g, "\xA0");
  const t1 = props.locale ? localeDir(props.locale) : void 0;
  const t2 = isoDuration(props.value, o) || void 0;
  const t3 = cn("srp-duration", digital && "srp-duration--digital", props.className);
  const t4 = "duration";
  const t5 = digital ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, shown), /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, formatDuration(props.value, locale, {
    ...o,
    display: "long"
  }))) : shown;
  let t6;
  if ($[0] !== lang || $[1] !== ref || $[2] !== rest || $[3] !== t1 || $[4] !== t2 || $[5] !== t3 || $[6] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("time", { lang, dir: t1, ...rest, ref, dateTime: t2, className: t3, "data-component": t4 }, t5);
    $[0] = lang;
    $[1] = ref;
    $[2] = rest;
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t5;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  return t6;
}
var Duration = /* @__PURE__ */ named("Duration", DurationRender);
export {
  Duration,
  formatDuration,
  isoDuration
};
//# sourceMappingURL=Duration.js.map
