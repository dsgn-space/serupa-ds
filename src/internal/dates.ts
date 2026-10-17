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
/** yyyy-mm-dd, for forms and APIs. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The locale's first day of the week (0 Sunday … 6 Saturday), where the browser knows it; otherwise Sunday. */
export function firstDayOfWeek(locale?: string): number {
  try {
    const l: any = new Intl.Locale(locale || new Intl.DateTimeFormat().resolvedOptions().locale);
    const info = typeof l.getWeekInfo === "function" ? l.getWeekInfo() : l.weekInfo;
    if (info && info.firstDay) return info.firstDay % 7;
  } catch { /* no Intl.Locale week info */ }
  return 0;
}

/** The order and separators of a short numeric date in the locale: ["month", "day", "year"] for en-US. */
export function dateOrder(locale?: string): ("day" | "month" | "year")[] {
  const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2001, 10, 22));
  return parts.filter((p) => p.type === "day" || p.type === "month" || p.type === "year").map((p) => p.type as "day" | "month" | "year");
}
/** A typed date in the locale's numeric order (11/22/2001, 22.11.2001, 2001-11-22), or null. Two-digit years are 20xx. */
export function parseDate(text: string, locale?: string): Date | null {
  const nums = text.trim().split(/[^0-9]+/).filter(Boolean);
  if (nums.length !== 3) return null;
  const order = /^\d{4}$/.test(nums[0]) ? (["year", "month", "day"] as const) : dateOrder(locale);
  const v: Record<string, number> = {};
  order.forEach((k, i) => { v[k] = Number(nums[i]); });
  if (v.year < 100) v.year += 2000;
  const d = new Date(v.year, v.month - 1, v.day);
  return d.getFullYear() === v.year && d.getMonth() === v.month - 1 && d.getDate() === v.day ? d : null;
}
/** A date in the locale's short numeric form, as people type it: 11/22/2001. */
export const formatDate = (d: Date, locale?: string) => new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
/** What to type, in the locale's order: mm/dd/yyyy, dd.mm.yyyy. */
export function datePattern(locale?: string): string {
  const parts = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2001, 10, 22));
  return parts.map((p) => (p.type === "day" ? "dd" : p.type === "month" ? "mm" : p.type === "year" ? "yyyy" : p.value)).join("");
}
