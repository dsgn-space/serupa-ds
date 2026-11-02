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
  zones?: readonly string[];
  /** The moment the offsets are shown for, as they change with daylight saving time. Default: now. */
  at?: Date | number;
  /** The language of the zone names ("Waktu Indonesia Barat"); otherwise the SerupaProvider's, else the browser's. */
  locale?: string;
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

const part = (f: Intl.DateTimeFormat, d: Date) => f.formatToParts(d).find((p) => p.type === "timeZoneName")?.value || "";
/** Every zone the browser knows (Intl.supportedValuesOf), with UTC, or a short list where it can't say. */
export function allTimeZones(): string[] {
  const list = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return list.includes("UTC") ? list.slice() : ["UTC", ...list];
}
/** A zone's city, offset and name at a moment, in a locale. null for a name the browser doesn't know. */
export function timeZoneInfo(zone: string, locale: string, at: Date = new Date()): TimeZoneInfo | null {
  let offsetPart: string, name: string;
  try {
    offsetPart = part(new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" }), at);
    name = part(new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: "long" }), at);
  } catch { return null; }
  const m = /([+-−])(\d{1,2}):?(\d{2})?/.exec(offsetPart);
  const offset = m ? (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0;
  const abs = Math.abs(offset);
  const offsetText = `UTC${offset < 0 ? "−" : "+"}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const city = zone === "UTC" ? "UTC" : (zone.split("/").pop() || zone).replace(/_/g, " ");
  // A name that's only the offset again ("GMT+07:00") says nothing more.
  return { zone, city, offset, offsetText, name: /^(GMT|UTC)([+-−]|$)/.test(name) ? "" : name };
}

/* TimeZonePicker: a Combobox of time zones. Each option is its city ("Jakarta"), with its offset now and its name in
   the reader's language under it ("UTC+07:00 · Western Indonesia Time"); they run from the furthest behind UTC to
   the furthest ahead, and the reader's own zone comes first, marked "Your time zone". Typing finds a city, a zone
   name, an IANA name or an offset ("+7", "07:00", "utc-5"). The value is the IANA name. */
/** A searchable list of time zones, by city, with each one's offset now and its name in the reader's language.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TimeZonePicker = /* @__PURE__ */ component<HTMLInputElement, TimeZonePickerProps>("TimeZonePicker", function TimeZonePicker(props, ref) {
  // Everything else is Combobox's, which keeps its own props off the DOM.
  const { zones, at, locale: ownLocale, className, ...rest } = props;
  const locale = useLocale(ownLocale);
  const labels = useSettings(words).labels;
  // The reader's own zone, known only in the browser: read after hydrating, so the server's list matches.
  const [mine, setMine] = React.useState<string | null>(null);
  React.useEffect(() => { try { setMine(new Intl.DateTimeFormat().resolvedOptions().timeZone || null); } catch { /* none */ } }, []);
  const atTime = at == null ? null : new Date(at).getTime();
  const zonesKey = zones ? zones.join(",") : "";
  const infos = React.useMemo(() => {
    const moment = atTime == null ? new Date() : new Date(atTime);
    const list = zonesKey ? zonesKey.split(",") : allTimeZones();
    return list.map((z) => timeZoneInfo(z, locale, moment)).filter((x): x is TimeZoneInfo => !!x)
      .sort((a, b) => a.offset - b.offset || a.city.localeCompare(b.city, locale));
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
    return [i.city, i.name, i.zone.replace(/_/g, " "), i.offsetText].some((s) => fold(s).includes(t));
  }, [byZone]);
  return <Combobox {...rest} ref={ref} className={cn("dk-time-zone-picker", className)} options={options} filter={filter} />;
});
