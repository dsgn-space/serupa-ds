// src/internal/dates.ts
import { latinDigits } from "./digits.js";
import { fold } from "./fold.js";
import { warnOnce } from "./warn.js";
var day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
var addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
function addMonths(d, n) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}
var sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
var sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
var startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
var startOfWeek = (d, weekStartsOn) => addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
var compare = (a, b) => day(a).getTime() - day(b).getTime();
var isValid = (d) => d instanceof Date && !isNaN(d.getTime());
var isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function toDay(v, who) {
  if (typeof v === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})([T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(v.trim());
    if (!m) {
      if (process.env.NODE_ENV !== "production" && who && v.trim()) warnOnce("date-string", `${who}: "${v.trim()}" isn't a "yyyy-mm-dd" day, so no date is shown. Pass the day as "yyyy-mm-dd" or a Date.`, who + ":string");
      return null;
    }
    const [, y = "", mo = "", da = "", time] = m;
    if (process.env.NODE_ENV !== "production" && who && time)
      warnOnce("datetime-string", `${who}: "${v.trim()}" is a date and time; it's read as ${y}-${mo}-${da}, the day it writes, and its time is ignored. Pass the "yyyy-mm-dd" day itself.`, who + ":datetime");
    const d = new Date(2e3, +mo - 1, +da);
    d.setFullYear(+y);
    const real = d.getMonth() === +mo - 1 && d.getDate() === +da;
    if (process.env.NODE_ENV !== "production" && who && !real) warnOnce("date-string", `${who}: "${v.trim()}" is not a day of the calendar, so no date is shown. Check the month and the day.`, who + ":string");
    return real ? d : null;
  }
  if (!isValid(v)) return null;
  if (process.env.NODE_ENV !== "production" && who && v.getTimezoneOffset() > 0 && v.getUTCHours() + v.getUTCMinutes() + v.getUTCSeconds() + v.getUTCMilliseconds() === 0)
    warnOnce("utc-date", `${who}: a Date at UTC midnight (${v.toISOString()}) is ${isoDate(v)} here, the day before. A Date made from "yyyy-mm-dd" is UTC; pass the "yyyy-mm-dd" string itself instead.`, who + ":utc");
  return day(v);
}
var SUNDAY_FIRST = /^(AG|AS|BD|BR|BS|BT|BW|BZ|CA|CO|DM|DO|ET|GT|GU|HK|HN|ID|IL|IN|JM|JP|KE|KH|KR|LA|MH|MM|MO|MT|MX|MZ|NI|NP|PA|PE|PH|PK|PR|PT|PY|SA|SG|SV|TH|TT|TW|UM|US|VE|VI|WS|YE|ZA|ZW)$/;
var SATURDAY_FIRST = /^(AF|BH|DJ|DZ|EG|IQ|IR|JO|KW|LY|OM|QA|SD|SY)$/;
function firstDayOfWeek(locale) {
  try {
    const l = new Intl.Locale(locale || new Intl.DateTimeFormat().resolvedOptions().locale);
    const info = typeof l.getWeekInfo === "function" ? l.getWeekInfo() : l.weekInfo;
    if (info && info.firstDay) return info.firstDay % 7;
    const region = l.region || (typeof l.maximize === "function" ? l.maximize().region : void 0);
    if (region) return SUNDAY_FIRST.test(region) ? 0 : SATURDAY_FIRST.test(region) ? 6 : region === "MV" ? 5 : 1;
  } catch {
  }
  return 0;
}
var numericFormats = /* @__PURE__ */ new Map();
function numeric(locale) {
  const key = locale || "";
  let f = numericFormats.get(key);
  if (!f) numericFormats.set(key, f = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", calendar: "gregory", numberingSystem: "latn" }));
  return f;
}
var shapes = /* @__PURE__ */ new Map();
function shape(locale) {
  const key = locale || "";
  let s = shapes.get(key);
  if (!s) {
    const parts = numeric(locale).formatToParts(new Date(2001, 10, 22));
    shapes.set(key, s = {
      order: Object.freeze(parts.filter((p) => p.type === "day" || p.type === "month" || p.type === "year").map((p) => p.type)),
      pattern: parts.map((p) => p.type === "day" ? "dd" : p.type === "month" ? "mm" : p.type === "year" ? "yyyy" : p.value).join("")
    });
  }
  return s;
}
function dateOrder(locale) {
  return shape(locale).order.slice();
}
function parseDate(text, locale, now = /* @__PURE__ */ new Date()) {
  const nums = latinDigits(text).trim().split(/[^0-9]+/).filter(Boolean);
  const own = dateOrder(locale);
  const month = monthIn(text, locale);
  if (month) {
    const [a, b] = nums;
    if (a === void 0 || b === void 0 || nums.length !== 2) return null;
    const [day2, year] = a.length === 4 ? [b, a] : [a, b];
    return fromParts([day2, String(month), year], ["day", "month", "year"], now);
  }
  const run = nums.length === 1 ? nums[0] : void 0;
  if (run !== void 0 && (run.length === 6 || run.length === 8)) {
    const yl = run.length - 4;
    const read = (order) => {
      let i = 0;
      const parts = order.map((k) => {
        const n = k === "year" ? yl : 2;
        i += n;
        return run.slice(i - n, i);
      });
      return fromParts(parts, order, now);
    };
    const mine = read(own), iso = yl === 4 ? read(["year", "month", "day"]) : null;
    if (!mine || !iso) return mine || iso;
    return Math.abs(iso.getFullYear() - now.getFullYear()) < Math.abs(mine.getFullYear() - now.getFullYear()) ? iso : mine;
  }
  if (nums.length !== 3) return null;
  return fromParts(nums, /^\d{4}$/.test(nums[0] ?? "") && own[0] !== "year" ? ["year", "month", "day"] : own, now);
}
var monthNames = /* @__PURE__ */ new Map();
function monthsOf(locale) {
  const key = locale || "";
  let m = monthNames.get(key);
  if (!m) {
    m = Array.from({ length: 12 }, () => []);
    for (const loc of [locale, "en"]) {
      for (const month of ["long", "short"]) {
        let alone, inDate;
        try {
          alone = new Intl.DateTimeFormat(loc, { month });
          inDate = new Intl.DateTimeFormat(loc, { day: "numeric", month });
        } catch {
          continue;
        }
        for (let i = 0; i < 12; i++) {
          const d = new Date(2e3, i, 1), part = inDate.formatToParts(d).find((p) => p.type === "month");
          for (const name of [alone.format(d), part ? part.value : ""]) {
            const f = fold(name).replace(/\.$/, "");
            const names = m[i];
            if (f && names && !/^\d+$/.test(f) && !names.includes(f)) names.push(f);
          }
        }
      }
    }
    monthNames.set(key, m);
  }
  return m;
}
function monthIn(text, locale) {
  const words = text.match(/\p{L}[\p{L}\p{M}]*/gu);
  if (!words) return 0;
  const months = monthsOf(locale);
  let found = 0;
  for (const w of words.map((x) => fold(x))) {
    const hits = months.map((names, i) => names.some((n) => n === w || w.length >= 3 && n.startsWith(w)) ? i + 1 : 0).filter(Boolean);
    const [hit] = hits;
    if (hit !== void 0 && hits.length === 1) {
      if (found && found !== hit) return 0;
      found = hit;
    }
  }
  return found;
}
function fromParts(nums, order, now) {
  const part = (k) => nums[order.indexOf(k)] ?? "";
  const month = Number(part("month")), day2 = Number(part("day"));
  let year = Number(part("year"));
  if (part("year").length <= 2) {
    const y = now.getFullYear();
    year += y - y % 100;
    if (year - y > 49) year -= 100;
    else if (y - year > 50) year += 100;
  }
  const d = new Date(2e3, 0, 1);
  d.setFullYear(year, month - 1, day2);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day2 ? d : null;
}
var formatDate = (d, locale) => numeric(locale).format(d);
function datePattern(locale) {
  return shape(locale).pattern;
}
export {
  addDays,
  addMonths,
  compare,
  dateOrder,
  datePattern,
  day,
  firstDayOfWeek,
  formatDate,
  isValid,
  isoDate,
  parseDate,
  sameDay,
  sameMonth,
  startOfMonth,
  startOfWeek,
  toDay
};
//# sourceMappingURL=dates.js.map
