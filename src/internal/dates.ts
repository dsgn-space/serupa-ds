import { latinDigits } from './digits';
import { fold } from './fold';
import { warnOnce } from './warn';

// Calendar dates without times: local midnight, so days compare and step reliably across daylight saving.

export const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** The same day n months on, or the month's last day when it's shorter (Jan 31 + 1 → Feb 28). */
export function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}
export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const sameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const startOfWeek = (d: Date, weekStartsOn: number) => addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));
export const compare = (a: Date, b: Date) => day(a).getTime() - day(b).getTime();
export const isValid = (d: unknown): d is Date => d instanceof Date && !isNaN(d.getTime());
/** yyyy-mm-dd, for forms and APIs: four digits of year even before 1000, so toDay reads it back. */
export const isoDate = (d: Date) => `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
/** A day given as a Date or a plain "yyyy-mm-dd" string (read as that local day, not UTC midnight), or null when
 *  it's neither. With who, warns once about a Date at UTC midnight west of Greenwich: new Date("2026-10-24") is
 *  23 Oct there, so pass the string instead. An ISO date and time as an API sends it ("2026-10-24T00:00:00Z",
 *  "2026-10-24 09:30:00") is read as the day it writes, its time ignored, and with who warns once (L8E10). */
export function toDay(v: unknown, who?: string): Date | null {
  if (typeof v === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})([T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(v.trim());
    // A string it can't read, or a day that doesn't exist (2026-02-31), shows as an empty field (GR161).
    if (!m) {
      if (process.env.NODE_ENV !== 'production' && who && v.trim()) warnOnce('date-string', `${who}: "${v.trim()}" isn't a "yyyy-mm-dd" day, so no date is shown. Pass the day as "yyyy-mm-dd" or a Date.`, who + ':string');
      return null;
    }
    const [, y = '', mo = '', da = '', time] = m;
    if (process.env.NODE_ENV !== 'production' && who && time)
      warnOnce('datetime-string', `${who}: "${v.trim()}" is a date and time; it's read as ${y}-${mo}-${da}, the day it writes, and its time is ignored. Pass the "yyyy-mm-dd" day itself.`, who + ':datetime');
    const d = new Date(2000, +mo - 1, +da); d.setFullYear(+y);
    const real = d.getMonth() === +mo - 1 && d.getDate() === +da;
    if (process.env.NODE_ENV !== 'production' && who && !real) warnOnce('date-string', `${who}: "${v.trim()}" is not a day of the calendar, so no date is shown. Check the month and the day.`, who + ':string');
    return real ? d : null;
  }
  if (!isValid(v)) return null;
  if (process.env.NODE_ENV !== 'production' && who && v.getTimezoneOffset() > 0 && v.getUTCHours() + v.getUTCMinutes() + v.getUTCSeconds() + v.getUTCMilliseconds() === 0)
    warnOnce('utc-date', `${who}: a Date at UTC midnight (${v.toISOString()}) is ${isoDate(v)} here, the day before. A Date made from "yyyy-mm-dd" is UTC; pass the "yyyy-mm-dd" string itself instead.`, who + ':utc');
  return day(v);
}

/** The locale's first day of the week (0 Sunday … 6 Saturday), where the browser knows it; otherwise Sunday. */
// Regions whose week starts on Sunday or Saturday (CLDR weekData; the Maldives starts on Friday, the rest on
// Monday), for browsers without Intl.Locale week info (Firefox).
const SUNDAY_FIRST = /^(AG|AS|BD|BR|BS|BT|BW|BZ|CA|CO|DM|DO|ET|GT|GU|HK|HN|ID|IL|IN|JM|JP|KE|KH|KR|LA|MH|MM|MO|MT|MX|MZ|NI|NP|PA|PE|PH|PK|PR|PT|PY|SA|SG|SV|TH|TT|TW|UM|US|VE|VI|WS|YE|ZA|ZW)$/;
const SATURDAY_FIRST = /^(AF|BH|DJ|DZ|EG|IQ|IR|JO|KW|LY|OM|QA|SD|SY)$/;

export function firstDayOfWeek(locale?: string): number {
  try {
    // getWeekInfo() (and the older weekInfo) are newer than TypeScript's Intl types.
    const l: Intl.Locale & { getWeekInfo?: () => { firstDay?: number }; weekInfo?: { firstDay?: number } } = new Intl.Locale(locale || new Intl.DateTimeFormat().resolvedOptions().locale);
    const info = typeof l.getWeekInfo === 'function' ? l.getWeekInfo() : l.weekInfo;
    if (info && info.firstDay) return info.firstDay % 7;
    const region = l.region || (typeof l.maximize === 'function' ? l.maximize().region : undefined);
    if (region) return SUNDAY_FIRST.test(region) ? 0 : SATURDAY_FIRST.test(region) ? 6 : region === 'MV' ? 5 : 1;
  } catch { /* no Intl.Locale */ }
  return 0;
}

// The typed date is always Gregorian with Latin digits, so it reads back as the same day: Thai (Buddhist years),
// ja-u-ca-japanese (era years) and fa (Persian calendar and digits) would otherwise drift on the way back in.
// Month names in the calendar grid stay localized.
// module state: a cache by locale; the same locale gives the same format in every request.
const numericFormats = new Map<string, Intl.DateTimeFormat>();
function numeric(locale?: string): Intl.DateTimeFormat {
  const key = locale || '';
  let f = numericFormats.get(key);
  if (!f) numericFormats.set(key, f = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'gregory', numberingSystem: 'latn' }));
  return f;
}
type Field = 'day' | 'month' | 'year';
// module state: a cache by locale, as numericFormats. A DatePicker reads both on every render and every keystroke.
const shapes = new Map<string, { order: readonly Field[]; pattern: string }>();
function shape(locale?: string) {
  const key = locale || '';
  let s = shapes.get(key);
  if (!s) {
    const parts = numeric(locale).formatToParts(new Date(2001, 10, 22));
    shapes.set(key, s = {
      order: Object.freeze(parts.filter((p) => p.type === 'day' || p.type === 'month' || p.type === 'year').map((p) => p.type as Field)),
      pattern: parts.map((p) => (p.type === 'day' ? 'dd' : p.type === 'month' ? 'mm' : p.type === 'year' ? 'yyyy' : p.value)).join(''),
    });
  }
  return s;
}
/** The order and separators of a short numeric date in the locale: ["month", "day", "year"] for en-US. */
export function dateOrder(locale?: string): Field[] {
  return shape(locale).order.slice();
}
/** A typed date in the locale's numeric order (11/22/2001, 22.11.2001, 2001-11-22, or digits alone: 11222001), or null. A one- or two-digit
 * year is the one within 50 years of now (in 2026: 85 is 1985, 30 is 2030, 75 is 2075 and 77 is 1977), so a birth
 * date or a deadline both read right. A leading 4-digit year reads as ISO year-month-day unless the locale writes its
 * year first. A month written as a word (12 Mei 2025, May 12, 2025) reads in the locale or in English. */
const JP_ERAS: Record<string, number> = { R: 2018, H: 1988, S: 1925, T: 1911, M: 1867, 令和: 2018, 平成: 1988, 昭和: 1925, 大正: 1911, 明治: 1867 };
// module state: a fixed Intl formatter, the same for every request.
let persianFmt: Intl.DateTimeFormat | undefined;
function persianToGregorian(y: number, m: number, d: number): Date | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (!persianFmt) persianFmt = new Intl.DateTimeFormat('en-u-ca-persian', { calendar: 'persian', numberingSystem: 'latn', year: 'numeric', month: 'numeric', day: 'numeric' });
  const parts = (dt: Date) => {
    const p = persianFmt!.formatToParts(dt), get = (t: string) => +(p.find((x) => x.type === t)?.value ?? 'NaN');
    return [get('year'), get('month'), get('day')] as const;
  };
  // Persian month 1 (Farvardin) begins around March 20–21; approximate then step exact days.
  let cur = new Date(y + 621, m + 1, Math.min(d, 28));
  for (let i = 0; i < 12; i++) {
    const [py, pm, pd] = parts(cur);
    const diff = (y - py) * 365 + (m - pm) * 30 + (d - pd);
    if (diff === 0) return cur;
    cur = addDays(cur, diff);
  }
  const [py, pm, pd] = parts(cur);
  return py === y && pm === m && pd === d ? cur : null;
}

function localeCalendar(locale?: string): string {
  try { return new Intl.DateTimeFormat(locale).resolvedOptions().calendar; } catch { return 'gregory'; }
}

export function parseDate(text: string, locale?: string, now: Date = new Date()): Date | null {
  const raw = latinDigits(text).trim();
  const nums = raw.split(/[^0-9]+/).filter(Boolean);
  const own = dateOrder(locale);
  // A month written as a word, as dates are pasted from an email or a document ("12 Mei 2025", "May 12, 2025",
  // "12. März 2025"): the four-digit number (or else the last) is the year and the other is the day (L8E8).
  const month = monthIn(text, locale);
  if (month) {
    const [a, b] = nums;
    if (a === undefined || b === undefined || nums.length !== 2) return null;
    // The four-digit one is the year; with none, the last.
    const [day, year] = a.length === 4 ? [b, a] : [a, b];
    return fromParts([day, String(month), year], ['day', 'month', 'year'], now);
  }
  const cal = localeCalendar(locale);
  // Japanese era prefix (e.g. "R8/10/24" or "令和8/10/24"): convert when the locale uses the Japanese calendar;
  // reject unparseable Latin letters attached to numeric dates rather than silently stripping them ("R8" → 2008).
  const eraMatch = /^(R|H|S|T|M|令和|平成|昭和|大正|明治)\s*(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D*$/i.exec(raw);
  if (eraMatch) {
    if (cal !== 'japanese') return null;
    const base = JP_ERAS[eraMatch[1]!.toUpperCase()] ?? JP_ERAS[eraMatch[1]!];
    if (!base) return null;
    return fromParts([String(base + Number(eraMatch[2])), eraMatch[3]!, eraMatch[4]!], ['year', 'month', 'day'], now);
  }
  if (/[A-Za-z]/.test(raw)) return null;
  // Digits alone, as typed on a number keypad: 6 or 8 of them, split in the locale's order (11222001 and 112201 in
  // en-US, 22112001 in de-DE), or as an ISO yyyymmdd. When both make a date (20011122 in de-DE is also 20.01.1122),
  // the one nearer now wins.
  const run = nums.length === 1 ? nums[0] : undefined;
  if (run !== undefined && (run.length === 6 || run.length === 8)) {
    const yl = run.length - 4;
    const read = (order: readonly string[]) => { let i = 0; const parts = order.map((k) => { const n = k === 'year' ? yl : 2; i += n; return run.slice(i - n, i); }); return fromParts(parts, order, now); };
    const mine = read(own), iso = yl === 4 ? read(['year', 'month', 'day']) : null;
    if (!mine || !iso) return mine || iso;
    return Math.abs(iso.getFullYear() - now.getFullYear()) < Math.abs(mine.getFullYear() - now.getFullYear()) ? iso : mine;
  }
  if (nums.length !== 3) return null;
  // A leading 4-digit year is ISO (2001-11-22), unless the locale itself writes the year first in another order
  // (Kyrgyz: year-day-month).
  const order = /^\d{4}$/.test(nums[0] ?? '') && own[0] !== 'year' ? (['year', 'month', 'day'] as const) : own;
  const yi = order.indexOf('year'), mi = order.indexOf('month'), di = order.indexOf('day');
  const yStr = nums[yi] ?? '', yVal = Number(yStr);
  if (cal === 'buddhist' && yStr.length === 4 && yVal >= 2400 && yVal <= 2700) {
    const adj = nums.slice();
    adj[yi] = String(yVal - 543);
    return fromParts(adj, order, now);
  }
  if (cal === 'roc' && yStr.length === 3 && yVal >= 100 && yVal <= 250) {
    const adj = nums.slice();
    adj[yi] = String(yVal + 1911);
    return fromParts(adj, order, now);
  }
  if (cal === 'persian' && yStr.length === 4 && yVal >= 1300 && yVal <= 1500) {
    return persianToGregorian(yVal, Number(nums[mi]), Number(nums[di]));
  }
  return fromParts(nums, order, now);
}
// Month names in the locale and in English, long and short, as they stand alone and inside a date (Russian "май"
// and "мая"), folded and without a closing dot.
// module state: a cache by locale, as numericFormats; a locale's month names are the same in every request.
const monthNames = new Map<string, string[][]>();
function monthsOf(locale?: string): string[][] {
  const key = locale || '';
  let m = monthNames.get(key);
  if (!m) {
    m = Array.from({ length: 12 }, () => [] as string[]);
    for (const loc of [locale, 'en']) {
      for (const month of ['long', 'short'] as const) {
        let alone: Intl.DateTimeFormat, inDate: Intl.DateTimeFormat;
        try { alone = new Intl.DateTimeFormat(loc, { month }); inDate = new Intl.DateTimeFormat(loc, { day: 'numeric', month }); } catch { continue; }
        for (let i = 0; i < 12; i++) {
          const d = new Date(2000, i, 1), part = inDate.formatToParts(d).find((p) => p.type === 'month');
          for (const name of [alone.format(d), part ? part.value : '']) {
            const f = fold(name).replace(/\.$/, '');
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
// The month (1–12) a word in text names, in full or by its first three or more letters ("Sept", "Des"), or 0 when
// no word names one month.
function monthIn(text: string, locale?: string): number {
  const words = text.match(/\p{L}[\p{L}\p{M}]*/gu);
  if (!words) return 0;
  const months = monthsOf(locale);
  let found = 0;
  for (const w of words.map((x) => fold(x))) {
    const hits = months.map((names, i) => (names.some((n) => n === w || (w.length >= 3 && n.startsWith(w))) ? i + 1 : 0)).filter(Boolean);
    const [hit] = hits;
    if (hit !== undefined && hits.length === 1) { if (found && found !== hit) return 0; found = hit; }
  }
  return found;
}
function fromParts(nums: string[], order: readonly string[], now: Date): Date | null {
  const part = (k: string) => nums[order.indexOf(k)] ?? '';
  const month = Number(part('month')), day = Number(part('day'));
  let year = Number(part('year'));
  if (part('year').length <= 2) {
    const y = now.getFullYear();
    year += y - (y % 100);
    if (year - y > 49) year -= 100;
    else if (y - year > 50) year += 100;
  }
  const d = new Date(2000, 0, 1);
  d.setFullYear(year, month - 1, day);   // so years 0–99 typed with four digits stay themselves, not 19xx
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
}
/** A date in the locale's short numeric form, as people type it: 11/22/2001. */
export const formatDate = (d: Date, locale?: string) => numeric(locale).format(d);
/** What to type, in the locale's order: mm/dd/yyyy, dd.mm.yyyy. */
export function datePattern(locale?: string): string {
  return shape(locale).pattern;
}
