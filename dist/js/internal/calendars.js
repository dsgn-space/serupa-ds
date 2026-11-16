// src/internal/calendars.ts
import { addDays, addMonths, sameMonth, startOfMonth } from "./dates.js";
import { warnOnce } from "./warn.js";
var SAME_MONTHS = { gregory: 1, buddhist: 1, japanese: 1, roc: 1 };
var OWN_MONTHS = { persian: 1, "islamic-umalqura": 1, "islamic-civil": 1, "islamic-tbla": 1, indian: 1 };
var gregory = {
  id: "gregory",
  start: startOfMonth,
  add: addMonths,
  same: sameMonth,
  date: (d) => d.getDate(),
  index: (d) => d.getFullYear() * 12 + d.getMonth(),
  at: (n) => {
    const d = new Date(2e3, (n % 12 + 12) % 12, 1);
    d.setFullYear(Math.floor(n / 12));
    return d;
  }
};
var CALS = /* @__PURE__ */ new Map();
function own(id) {
  const f = new Intl.DateTimeFormat("en-u-ca-" + id, { calendar: id, numberingSystem: "latn", year: "numeric", month: "numeric", day: "numeric" });
  const memo = /* @__PURE__ */ new Map();
  const ymd = (d) => {
    const t = d.getTime();
    let r = memo.get(t);
    if (!r) {
      const p = f.formatToParts(d), n = (type) => +(p.find((x) => x.type === type) || { value: "NaN" }).value;
      r = [n("year"), n("month") - 1, n("day")];
      if (memo.size > 4e3) memo.clear();
      memo.set(t, r);
    }
    return r;
  };
  const index = (d) => {
    const [y, m] = ymd(d);
    return y * 12 + m;
  };
  const start = (d) => addDays(d, 1 - ymd(d)[2]);
  const next = (s) => {
    let d = addDays(s, 28);
    while (ymd(d)[2] !== 1) d = addDays(d, 1);
    return d;
  };
  const at = (n) => {
    const now = start(/* @__PURE__ */ new Date());
    let s = start(addDays(now, Math.round((n - index(now)) * 29.53)));
    for (let i = index(s); i < n; i++) s = next(s);
    for (let i = index(s); i > n; i--) s = start(addDays(s, -1));
    return s;
  };
  return {
    id,
    start,
    at,
    index,
    date: (d) => ymd(d)[2],
    same: (a, b) => index(a) === index(b),
    add: (d, n) => {
      const s = at(index(d) + n), last = ymd(addDays(next(s), -1))[2];
      return addDays(s, Math.min(ymd(d)[2], last) - 1);
    }
  };
}
function calendarOf(asked, who) {
  const id = asked;
  if (!id || id === "gregory") return gregory;
  let c = CALS.get(id);
  if (!c) {
    if (id in SAME_MONTHS) c = { ...gregory, id };
    else if (id in OWN_MONTHS) c = own(id);
    else {
      if (process.env.NODE_ENV !== "production") warnOnce("calendar-system", `${who}: the "${id}" calendar isn't one the date grids draw, so they draw Gregorian. Use one of ${Object.keys(SAME_MONTHS).concat(Object.keys(OWN_MONTHS)).join(", ")}.`, who + ":" + id);
      return gregory;
    }
    CALS.set(id, c);
  }
  return c;
}
export {
  calendarOf
};
//# sourceMappingURL=calendars.js.map
