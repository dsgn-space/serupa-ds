import { addDays, addMonths, sameMonth, startOfMonth } from './dates';
import { warnOnce } from './warn';

/** A calendar system the date grids can draw: Gregorian (the default), or one an app's people date things in. Each
 *  has twelve months. buddhist, japanese and roc share the Gregorian months and count years their own way; persian,
 *  the islamic ones and indian have months of their own. Values stay Dates either way. */
export type CalendarSystem = 'gregory' | 'buddhist' | 'japanese' | 'roc' | 'persian' | 'islamic-umalqura' | 'islamic-civil' | 'islamic-tbla' | 'indian';

const SAME_MONTHS = { gregory: 1, buddhist: 1, japanese: 1, roc: 1 } as const;
const OWN_MONTHS = { persian: 1, 'islamic-umalqura': 1, 'islamic-civil': 1, 'islamic-tbla': 1, indian: 1 } as const;

/** Months and days in one calendar system. A month is held as the Date of its first day; n is a month counted from
 *  year 0 of the calendar (year * 12 + month), which the month and year grids page through. */
export interface Cal {
  id: CalendarSystem;
  /** The first day of d's month. */
  start: (d: Date) => Date;
  /** The same day n months on, or the month's last day when it's shorter. */
  add: (d: Date, n: number) => Date;
  same: (a: Date, b: Date) => boolean;
  /** The day of the month, 1 to 31. */
  date: (d: Date) => number;
  /** d's month as year * 12 + month (0-based), in this calendar's years. */
  index: (d: Date) => number;
  /** The first day of month n. */
  at: (n: number) => Date;
}

const gregory: Cal = {
  id: 'gregory', start: startOfMonth, add: addMonths, same: sameMonth, date: (d) => d.getDate(),
  index: (d) => d.getFullYear() * 12 + d.getMonth(),
  at: (n) => { const d = new Date(2000, ((n % 12) + 12) % 12, 1); d.setFullYear(Math.floor(n / 12)); return d; },
};

// module state: one Cal per system, and each one's days read once (a grid of 42 days reads them on every render).
const CALS = new Map<string, Cal>();

// A calendar with months of its own, from Intl: its year, month and day for a local midnight. Years count on without
// resetting in the range a grid can show (the Persian AP, the Hijri AH, the Saka year).
function own(id: CalendarSystem): Cal {
  const f = new Intl.DateTimeFormat('en-u-ca-' + id, { calendar: id, numberingSystem: 'latn', year: 'numeric', month: 'numeric', day: 'numeric' });
  const memo = new Map<number, [number, number, number]>();
  const ymd = (d: Date): [number, number, number] => {
    const t = d.getTime();
    let r = memo.get(t);
    if (!r) {
      const p = f.formatToParts(d), n = (type: string) => +(p.find((x) => x.type === type) || { value: 'NaN' }).value;
      r = [n('year'), n('month') - 1, n('day')];
      if (memo.size > 4000) memo.clear();
      memo.set(t, r);
    }
    return r;
  };
  const index = (d: Date) => { const [y, m] = ymd(d); return y * 12 + m; };
  const start = (d: Date) => addDays(d, 1 - ymd(d)[2]);
  // Months are 29 to 31 days long: the next one starts within 32 days of this one's first.
  const next = (s: Date) => { let d = addDays(s, 28); while (ymd(d)[2] !== 1) d = addDays(d, 1); return d; };
  const at = (n: number) => {
    // A first guess at a mean month's length from today's month, then a month at a time to the right one.
    const now = start(new Date());
    let s = start(addDays(now, Math.round((n - index(now)) * 29.53)));
    for (let i = index(s); i < n; i++) s = next(s);
    for (let i = index(s); i > n; i--) s = start(addDays(s, -1));
    return s;
  };
  return {
    id, start, at, index, date: (d) => ymd(d)[2], same: (a, b) => index(a) === index(b),
    add: (d, n) => { const s = at(index(d) + n), last = ymd(addDays(next(s), -1))[2]; return addDays(s, Math.min(ymd(d)[2], last) - 1); },
  };
}

/** The calendar system to draw: the one asked for, else Gregorian. A locale's -u-ca- extension (ja-u-ca-japanese)
 *  or its own default (Thai's Buddhist years) isn't followed: the grids have always drawn Gregorian for those, and
 *  an app that wants another calendar says so. */
export function calendarOf(asked: string | undefined, who: string): Cal {
  const id = asked;
  if (!id || id === 'gregory') return gregory;
  let c = CALS.get(id);
  if (!c) {
    if (id in SAME_MONTHS) c = { ...gregory, id: id as CalendarSystem };
    else if (id in OWN_MONTHS) c = own(id as CalendarSystem);
    else {
      if (process.env.NODE_ENV !== 'production') warnOnce('calendar-system', `${who}: the "${id}" calendar isn't one the date grids draw, so they draw Gregorian. Use one of ${Object.keys(SAME_MONTHS).concat(Object.keys(OWN_MONTHS)).join(', ')}.`, who + ':' + id);
      return gregory;
    }
    CALS.set(id, c);
  }
  return c;
}
