"use client";
import * as React from "react";
import { cn } from "../../internal/cn";
import { component } from "../../internal/component";
import { fold } from "../../internal/fold";
import { useLocale, useSettings } from "../../internal/provider";
import { Combobox, type ComboboxSingleProps } from "../Combobox/Combobox";
import { en as words } from "./labels";

export interface TimeZonePickerProps extends Omit<ComboboxSingleProps, "options" | "loadOptions" | "debounce" | "filter" | "multiple"> {
  /** The time zones to offer, as IANA names ("Asia/Jakarta"). Default: every zone the browser knows, and "UTC". */
  zones?: readonly string[] | undefined;
  /** The moment the offsets are shown for, as they change with daylight saving time. Default: now. */
  at?: Date | number | undefined;
  /** The language of the zone names ("Waktu Indonesia Barat"); otherwise the SerupaProvider's, else the browser's. */
  locale?: string | undefined;
}

/** One time zone as TimeZonePicker shows it. */
export interface TimeZoneInfo {
  /** The IANA name: "America/New_York". */
  zone: string;
  /** Its city, from the name: "New York". */
  city: string;
  /** Minutes ahead of UTC at the moment: 420 for UTC+07:00, -300 for UTC-05:00. */
  offset: number;
  /** "UTC+07:00". */
  offsetText: string;
  /** Its name in the locale's words, where the browser has one: "Western Indonesia Time", "Waktu Indonesia Barat". */
  name: string;
}

// Zones renamed since the browser's list was made (tzdata's "backward" file): Chromium still lists Europe/Kiev,
// Asia/Calcutta and Asia/Saigon, while servers, Postgres, Temporal and Firefox give Europe/Kyiv, Asia/Kolkata and
// Asia/Ho_Chi_Minh. The picker shows, searches and hands back the current name, and still finds the old spelling (GR174).
const RENAMED: Record<string, string> = {
  "Europe/Kiev": "Europe/Kyiv", "Asia/Calcutta": "Asia/Kolkata", "Asia/Katmandu": "Asia/Kathmandu", "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "America/Godthab": "America/Nuuk", "Asia/Rangoon": "Asia/Yangon", "Asia/Ulan_Bator": "Asia/Ulaanbaatar", "Asia/Dacca": "Asia/Dhaka",
  "Asia/Thimbu": "Asia/Thimphu", "Asia/Macao": "Asia/Macau", "Asia/Ujung_Pandang": "Asia/Makassar", "Atlantic/Faeroe": "Atlantic/Faroe",
  "Africa/Asmera": "Africa/Asmara", "Pacific/Truk": "Pacific/Chuuk", "Pacific/Ponape": "Pacific/Pohnpei", "Pacific/Enderbury": "Pacific/Kanton",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires", "America/Catamarca": "America/Argentina/Catamarca",
  "America/Cordoba": "America/Argentina/Cordoba", "America/Jujuy": "America/Argentina/Jujuy", "America/Mendoza": "America/Argentina/Mendoza",
  "America/Indianapolis": "America/Indiana/Indianapolis", "America/Louisville": "America/Kentucky/Louisville", "America/Coral_Harbour": "America/Atikokan",
};
const oldName = (zone: string) => Object.keys(RENAMED).find((o) => RENAMED[o] === zone) || "";
// What people type that isn't in a zone's name: abbreviations and big cities that share another city's zone.
const ALSO: Record<string, string> = {
  UTC: "gmt", "Europe/London": "gmt bst", "America/New_York": "est edt eastern nyc", "America/Chicago": "cst cdt central",
  "America/Denver": "mst mdt mountain", "America/Los_Angeles": "pst pdt pacific san francisco", "Asia/Kolkata": "ist india mumbai delhi bengaluru bangalore",
  "Asia/Shanghai": "china beijing", "Asia/Jakarta": "wib", "Asia/Makassar": "wita bali", "Asia/Jayapura": "wit", "Asia/Tokyo": "jst",
  "Asia/Seoul": "kst", "Europe/Paris": "cet cest", "Europe/Berlin": "cet cest", "Australia/Sydney": "aest aedt", "Asia/Karachi": "pkt",
};
/** A zone's current IANA name: the browser's own form of what it's given, then its newer name if it has been renamed
    ("Europe/Kiev" and "Europe/Kyiv" are both "Europe/Kyiv"). A name the browser doesn't know comes back as it is. */
function currentTimeZone(zone: string): string {
  let listed = zone;
  try { listed = new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone || zone; } catch { /* not a zone */ }
  return RENAMED[listed] || RENAMED[zone] || listed;
}

const part = (f: Intl.DateTimeFormat, d: Date) => f.formatToParts(d).find((p) => p.type === "timeZoneName")?.value || "";
/** Every zone the browser knows (Intl.supportedValuesOf), with UTC, or a short list where it can't say. */
export function allTimeZones(): string[] {
  const list = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone").map((z) => RENAMED[z] || z) : [];
  return [...new Set(list.includes("UTC") ? list : ["UTC", ...list])];
}
/** A zone's city, offset and name at a moment, in a locale, under its current name. null for a name the browser doesn't know. */
// Each zone's two formatters, made once per zone and language: building some 800 of them was most of a mount's time,
// and every picker on the page, and every later mount, uses the same ones.
// module state: a formatter is the same for every request (it holds only a zone and a language, nothing of a reader's).
const formats = new Map<string, Intl.DateTimeFormat>();
const formatter = (locale: string, zone: string, timeZoneName: "longOffset" | "long") => {
  const key = locale + "|" + zone + "|" + timeZoneName;
  let f = formats.get(key);
  if (!f) { f = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName }); formats.set(key, f); }
  return f;
};
export function timeZoneInfo(zone: string, locale: string, at: Date = new Date()): TimeZoneInfo | null {
  zone = RENAMED[zone] || zone;
  let offsetPart: string, name: string;
  try {
    offsetPart = part(formatter("en-US", zone, "longOffset"), at);
    name = part(formatter(locale, zone, "long"), at);
  } catch { return null; }
  const m = /([+\-−])(\d{1,2}):?(\d{2})?/.exec(offsetPart);
  const offset = m ? (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0;
  const abs = Math.abs(offset);
  const offsetText = `UTC${offset < 0 ? "−" : "+"}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const city = zone === "UTC" ? "UTC" : (zone.split("/").pop() || zone).replace(/_/g, " ");
  // A name that's only the offset again ("GMT+07:00") says nothing more.
  return { zone, city, offset, offsetText, name: /^(GMT|UTC)([+\-−]|$)/.test(name) ? "" : name };
}

/* TimeZonePicker: a Combobox of time zones. Each option is its city ("Jakarta"), with its offset now and its name in
   the reader's language under it ("UTC+07:00 · Western Indonesia Time"); they run from the furthest behind UTC to
   the furthest ahead, and the reader's own zone comes first, marked "Your time zone". Typing finds a city, a zone
   name, an IANA name or an offset ("+7", "07:00", "utc-5"). The value is the IANA name. */
/** A searchable list of time zones, by city, with each one's offset now and its name in the reader's language.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TimeZonePicker = /* @__PURE__ */ component<HTMLInputElement, TimeZonePickerProps>("TimeZonePicker", function TimeZonePicker(props, ref) {
  // Everything else is Combobox's, which keeps its own props off the DOM.
  const { zones, at, locale: ownLocale, className, value, defaultValue, ...rest } = props;
  // A value under an old or other spelling of a listed zone matches it ("Europe/Kiev", "Asia/Calcutta").
  const canon = (v: string | null | undefined) => (typeof v === "string" && v ? currentTimeZone(v) : v);
  const locale = useLocale(ownLocale);
  const labels = useSettings(words).labels;
  // The reader's own zone, known only in the browser: read after hydrating, so the server's list matches.
  const [mine, setMine] = React.useState<string | null>(null);
  React.useEffect(() => { try { const z = new Intl.DateTimeFormat().resolvedOptions().timeZone; setMine(z ? currentTimeZone(z) : null); } catch { /* none */ } }, []);
  const atTime = at == null ? null : new Date(at).getTime();
  const zonesKey = zones ? [...new Set(zones.map(currentTimeZone))].join(",") : "";
  const infos = React.useMemo(() => {
    const moment = atTime == null ? new Date() : new Date(atTime);
    const collator = new Intl.Collator(locale);
    const list = zonesKey ? zonesKey.split(",") : allTimeZones();
    return list.map((z) => timeZoneInfo(z, locale, moment)).filter((x): x is TimeZoneInfo => !!x)
      .sort((a, b) => a.offset - b.offset || collator.compare(a.city, b.city));
  }, [locale, atTime, zonesKey]);
  const byZone = React.useMemo(() => new Map(infos.map((i) => [i.zone, i])), [infos]);
  const options = React.useMemo(() => {
    const own = mine ? byZone.get(mine) : undefined;
    const ordered = own ? [own, ...infos.filter((i) => i !== own)] : infos;
    return ordered.map((i) => ({
      value: i.zone, label: i.city,
      description: i === own ? `${i.offsetText} · ${labels.timeZoneYours}` : i.name ? `${i.offsetText} · ${i.name}` : i.offsetText,
    }));
  }, [infos, byZone, mine, labels]);
  // A typed offset ("+7", "07:00", "utc-5", "−3:30") finds the zones at it; anything else is looked for in the city,
  // the zone's name and its IANA name.
  const filter = React.useCallback((o: { value: string; label: string }, text: string) => {
    const i = byZone.get(o.value), t = fold(text.trim());
    if (!i || !t) return true;
    const m = /^(?:utc|gmt)?\s*([+\-−])\s*(\d{1,2})(?::?(\d{2}))?$/.exec(t);
    if (m) return i.offset === (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0));
    return [i.city, i.name, i.zone.replace(/_/g, " "), oldName(i.zone).replace(/_/g, " "), ALSO[i.zone] || "", i.offsetText].some((s) => s && fold(s).includes(t));
  }, [byZone]);
  return <Combobox {...rest} ref={ref} className={cn("dk-time-zone-picker", className)} options={options} filter={filter}
    {...(value !== undefined ? { value: canon(value) } : null)} {...(defaultValue !== undefined ? { defaultValue: canon(defaultValue) } : null)} />;
});
