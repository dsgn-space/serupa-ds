import { latinDigits } from "./digits";

// Times of day as minutes since midnight, written "HH:mm" for forms and APIs.

/** "14:05" → 845, or null. */
export function toMinutes(v: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((v || "").trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}
/** 845 → "14:05". */
export const toHHmm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
/** Whether the locale writes times with AM and PM. */
export function uses12h(locale?: string): boolean {
  return !!new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12;
}
const formats = new Map<string, Intl.DateTimeFormat>();
/** A time as the locale writes it: "2:05 PM", "14:05". */
export function formatTime(n: number, locale?: string, hour12?: boolean): string {
  const h12 = hour12 ?? uses12h(locale);
  const key = (locale || "") + "|" + h12;
  let f = formats.get(key);
  if (!f) formats.set(key, f = new Intl.DateTimeFormat(locale, { hour: h12 ? "numeric" : "2-digit", minute: "2-digit", hour12: h12 }));
  return f.format(new Date(2000, 0, 1, Math.floor(n / 60), n % 60));
}
// The locale's own words for morning and afternoon ("오전" "오후" in ko, "ص" "م" in ar), lowercased without spaces.
const periods = new Map<string, [string, string]>();
function periodsOf(locale?: string): [string, string] {
  const key = locale || "";
  let p = periods.get(key);
  if (!p) {
    const f = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true });
    const word = (h: number) => (f.formatToParts(new Date(2000, 0, 1, h)).find((x) => x.type === "dayPeriod")?.value || "").toLowerCase().replace(/\s+/g, "");
    periods.set(key, p = [word(9), word(14)]);
  }
  return p;
}
/** A typed time, as minutes, or null: "14:05", "2:05 pm", "2pm", "1405", "9", "9.30", "21h30", and the locale's own form,
    such as "오후 2:05" (ko), "٢:٠٥ م" (ar-EG) or "۱۴:۰۵" (fa): digits in any script and the locale's words for AM and PM
    are read. Without am/pm, a 12-hour locale still reads 13–23 as afternoon; 1–11 stay morning. */
export function parseTime(text: string, locale?: string): number | null {
  let s = latinDigits(text).trim().toLowerCase().replace(/[\u200e\u200f\u061c]/g, "").replace(/\s+/g, "");
  if (!s) return null;
  let ap = "";
  const [am, pm] = periodsOf(locale);
  // The longer word first, in case one contains the other.
  for (const [w, v] of ([[am, "a"], [pm, "p"]] as const).slice().sort((x, y) => y[0].length - x[0].length)) {
    if (w && !/^(am|pm|a\.m\.|p\.m\.)$/.test(w) && s.includes(w)) { ap = v; s = s.replace(w, ""); break; }
  }
  const m = /^(\d{1,2})(?:[:.h]?(\d{2}))?(a|am|a\.m\.|p|pm|p\.m\.)?$/.exec(s);
  if (!m) return null;
  if (m[3]) { if (ap) return null; ap = m[3][0]; }
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (min > 59) return null;
  if (ap) { if (h < 1 || h > 12) return null; if (h === 12) h = 0; if (ap === "p") h += 12; }
  else if (h > 23) return null;
  return h * 60 + min;
}
