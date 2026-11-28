"use client";

// src/components/FormattedDate/FormattedDate.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { canonicalLocale, localeDir } from "../../internal/locale.js";
import { useLocale, useOwnLang } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
var DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
var PARTS = ["weekday", "era", "year", "month", "day", "dayPeriod", "hour", "minute", "second", "fractionalSecondDigits", "timeZoneName"];
function read(v) {
  if (typeof v === "string" && DAY.test(v.trim())) {
    const [, y, m, d] = DAY.exec(v.trim()).map(Number);
    const date2 = new Date(Date.UTC(2e3, m - 1, d));
    date2.setUTCFullYear(y);
    return date2.getUTCMonth() === m - 1 && date2.getUTCDate() === d ? {
      date: date2,
      day: true,
      iso: v.trim()
    } : null;
  }
  const date = v instanceof Date ? v : typeof v === "number" || typeof v === "string" ? new Date(v) : null;
  return date && !isNaN(date.getTime()) ? {
    date,
    day: false,
    iso: date.toISOString()
  } : null;
}
function intlOptions(day, o, zone) {
  const own = o.options || {};
  const parts = PARTS.some((p) => own[p] !== void 0);
  const styles = parts ? {} : {
    dateStyle: o.dateStyle === false ? void 0 : o.dateStyle || "medium",
    timeStyle: day ? void 0 : o.timeStyle
  };
  if (!parts && !styles.dateStyle && !styles.timeStyle) styles.dateStyle = "medium";
  const out = {
    ...styles,
    ...own,
    timeZone: day ? "UTC" : o.timeZone ?? own.timeZone ?? zone
  };
  if (day) for (const p of ["hour", "minute", "second", "dayPeriod", "fractionalSecondDigits", "timeZoneName"]) delete out[p];
  return out;
}
function formatter(locale, options, day) {
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") warnOnce("date-options", `FormattedDate: ${e.message}, so it's written as a medium date. Check timeZone and options.`);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: day ? "UTC" : void 0
    });
  }
}
var CLOCK = /* @__PURE__ */ new Set(["hour", "minute", "second", "fractionalSecond"]);
function keepTimeTogether(parts) {
  return parts.map((p, i) => {
    const before = parts[i - 1]?.type, after = parts[i + 1]?.type;
    const joins = p.type === "literal" && /^\s+$/.test(p.value) && (CLOCK.has(before) && after === "dayPeriod" || before === "dayPeriod" && CLOCK.has(after));
    return joins ? {
      ...p,
      value: "\xA0"
    } : p;
  });
}
var TIME = /* @__PURE__ */ new Set(["hour", "minute", "second", "fractionalSecond", "dayPeriod", "timeZoneName"]);
function halves(parts) {
  const a = parts.findIndex((p) => p.type !== "literal");
  const cut = parts.findIndex((p, n) => n > a && p.type !== "literal" && TIME.has(p.type) !== TIME.has(parts[a].type));
  if (cut < 0) return [];
  let b = cut;
  while (parts[b - 1].type === "literal") b--;
  const text = (x) => x.map((p) => p.value).join("");
  const out = [text(parts.slice(0, b)), text(parts.slice(b, cut)), text(parts.slice(cut))];
  return out[0].length > 20 || out[2].length > 20 ? [] : out;
}
function pieces(value, locale, o, zone) {
  const from = read(value);
  if (!from) return null;
  const end = o.to === void 0 ? null : read(o.to);
  const to = end && from.day && !end.day ? read(`${end.date.getFullYear()}-${String(end.date.getMonth() + 1).padStart(2, "0")}-${String(end.date.getDate()).padStart(2, "0")}`) : end;
  const f = formatter(locale ? canonicalLocale(locale) : void 0, intlOptions(from.day, o, zone), from.day);
  const parts = keepTimeTogether(to ? f.formatRangeToParts(from.date, to.date) : f.formatToParts(from.date).map((p) => ({
    ...p,
    source: "shared"
  })));
  const out = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.source === p.source) last.text += p.value;
    else out.push({
      text: p.value,
      source: p.source
    });
  }
  return {
    from,
    to,
    pieces: out,
    runs: to ? [] : halves(parts)
  };
}
function formatDate(value, locale, options = {}) {
  return pieces(value, locale, options)?.pieces.map((p) => p.text).join("") ?? "";
}
var never = () => () => {
};
var inBrowser = () => true;
var onServer = () => false;
function FormattedDateRender(t0) {
  const $ = _c(8);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    value: 1,
    to: 1,
    dateStyle: 1,
    timeStyle: 1,
    timeZone: 1,
    options: 1,
    locale: 1,
    className: 1
  });
  const locale = useLocale(props.locale);
  const lang = useOwnLang(props.locale);
  const browser = React.useSyncExternalStore(never, inBrowser, onServer);
  const o = {
    to: props.to,
    dateStyle: props.dateStyle,
    timeStyle: props.timeStyle,
    timeZone: props.timeZone,
    options: props.options
  };
  const made = pieces(props.value, locale, o, browser ? void 0 : "UTC");
  const invalid = !made;
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && invalid) {
      warnOnce("date-value", `FormattedDate: ${JSON.stringify(String(props.value))} isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, an ISO date and time, or a "yyyy-mm-dd" day.`);
    }
  }, [invalid, props.value]);
  const cls = cn("srp-formatted-date", props.className);
  const dir = props.locale ? localeDir(props.locale) : void 0;
  if (made?.to && made.pieces.some(_temp)) {
    return /* @__PURE__ */ React.createElement("span", { lang, dir, ...rest, ref, className: cls, "data-component": "formatted-date", suppressHydrationWarning: true }, made.pieces.map((p, i) => p.source === "shared" ? p.text : /* @__PURE__ */ React.createElement("time", { key: i, dateTime: (p.source === "startRange" ? made.from : made.to).iso, suppressHydrationWarning: true }, p.text)));
  }
  const t1 = ref;
  const t2 = made?.from.iso;
  const t3 = "formatted-date";
  const t4 = true;
  const t5 = made?.runs.length ? made.runs.map(_temp2) : made?.pieces[0]?.text;
  let t6;
  if ($[0] !== cls || $[1] !== dir || $[2] !== lang || $[3] !== rest || $[4] !== t1 || $[5] !== t2 || $[6] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("time", { lang, dir, ...rest, ref: t1, dateTime: t2, className: cls, "data-component": t3, suppressHydrationWarning: t4 }, t5);
    $[0] = cls;
    $[1] = dir;
    $[2] = lang;
    $[3] = rest;
    $[4] = t1;
    $[5] = t2;
    $[6] = t5;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  return t6;
}
function _temp2(r, i_0) {
  return i_0 === 1 ? r : /* @__PURE__ */ React.createElement("span", { key: i_0, className: "srp-formatted-date__half" }, r);
}
function _temp(p_0) {
  return p_0.source !== "shared";
}
var FormattedDate = /* @__PURE__ */ named("FormattedDate", FormattedDateRender);
export {
  FormattedDate,
  formatDate
};
//# sourceMappingURL=FormattedDate.js.map
