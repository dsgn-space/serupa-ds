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
/** A time as the locale writes it: "2:05 PM", "14:05". */
export function formatTime(n: number, locale?: string, hour12?: boolean): string {
  const h12 = hour12 ?? uses12h(locale);
  return new Intl.DateTimeFormat(locale, { hour: h12 ? "numeric" : "2-digit", minute: "2-digit", hour12: h12 }).format(new Date(2000, 0, 1, Math.floor(n / 60), n % 60));
}
/** A typed time, as minutes, or null: "14:05", "2:05 pm", "2pm", "1405", "9", "9.30", "21h30". Without am/pm, a 12-hour
    locale still reads 13–23 as afternoon; 1–11 stay morning. */
export function parseTime(text: string): number | null {
  const s = text.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;
  const m = /^(\d{1,2})(?:[:.h]?(\d{2}))?(a|am|a\.m\.|p|pm|p\.m\.)?$/.exec(s) || /^(\d{1,2})(\d{2})(a|am|p|pm)?$/.exec(s);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = m[3] ? m[3][0] : "";
  if (min > 59) return null;
  if (ap) { if (h < 1 || h > 12) return null; if (h === 12) h = 0; if (ap === "p") h += 12; }
  else if (h > 23) return null;
  return h * 60 + min;
}
