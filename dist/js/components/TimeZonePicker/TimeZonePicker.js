"use client";

// src/components/TimeZonePicker/TimeZonePicker.tsx
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { fold } from "../../internal/fold.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Combobox } from "../Combobox/Combobox.js";
import { en as words } from "./labels.js";
var RENAMED = {
  "Europe/Kiev": "Europe/Kyiv",
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "America/Godthab": "America/Nuuk",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Ulan_Bator": "Asia/Ulaanbaatar",
  "Asia/Dacca": "Asia/Dhaka",
  "Asia/Thimbu": "Asia/Thimphu",
  "Asia/Macao": "Asia/Macau",
  "Asia/Ujung_Pandang": "Asia/Makassar",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "Africa/Asmera": "Africa/Asmara",
  "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Enderbury": "Pacific/Kanton",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Catamarca": "America/Argentina/Catamarca",
  "America/Cordoba": "America/Argentina/Cordoba",
  "America/Jujuy": "America/Argentina/Jujuy",
  "America/Mendoza": "America/Argentina/Mendoza",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Louisville": "America/Kentucky/Louisville",
  "America/Coral_Harbour": "America/Atikokan"
};
var oldName = (zone) => Object.keys(RENAMED).find((o) => RENAMED[o] === zone) || "";
var ALSO = {
  UTC: "gmt",
  "Europe/London": "gmt bst",
  "America/New_York": "est edt eastern nyc",
  "America/Chicago": "cst cdt central",
  "America/Denver": "mst mdt mountain",
  "America/Los_Angeles": "pst pdt pacific san francisco",
  "Asia/Kolkata": "ist india mumbai delhi bengaluru bangalore",
  "Asia/Shanghai": "china beijing",
  "Asia/Jakarta": "wib",
  "Asia/Makassar": "wita bali",
  "Asia/Jayapura": "wit",
  "Asia/Tokyo": "jst",
  "Asia/Seoul": "kst",
  "Europe/Paris": "cet cest",
  "Europe/Berlin": "cet cest",
  "Australia/Sydney": "aest aedt",
  "Asia/Karachi": "pkt"
};
function currentTimeZone(zone) {
  let listed = zone;
  try {
    listed = new Intl.DateTimeFormat("en-US", { timeZone: zone }).resolvedOptions().timeZone || zone;
  } catch {
  }
  return RENAMED[listed] || RENAMED[zone] || listed;
}
var part = (f, d) => f.formatToParts(d).find((p) => p.type === "timeZoneName")?.value || "";
function allTimeZones() {
  const list = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone").map((z) => RENAMED[z] || z) : [];
  return [...new Set(list.includes("UTC") ? list : ["UTC", ...list])];
}
var formats = /* @__PURE__ */ new Map();
var formatter = (locale, zone, timeZoneName) => {
  const key = locale + "|" + zone + "|" + timeZoneName;
  let f = formats.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName });
    formats.set(key, f);
  }
  return f;
};
function timeZoneInfo(zone, locale, at = /* @__PURE__ */ new Date()) {
  zone = RENAMED[zone] || zone;
  let offsetPart, name;
  try {
    offsetPart = part(formatter("en-US", zone, "longOffset"), at);
    name = part(formatter(locale, zone, "long"), at);
  } catch {
    return null;
  }
  const m = /([+\-−])(\d{1,2}):?(\d{2})?/.exec(offsetPart);
  const offset = m ? (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0;
  const abs = Math.abs(offset);
  const offsetText = `UTC${offset < 0 ? "\u2212" : "+"}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const city = zone === "UTC" ? "UTC" : (zone.split("/").pop() || zone).replace(/_/g, " ");
  return { zone, city, offset, offsetText, name: /^(GMT|UTC)([+\-−]|$)/.test(name) ? "" : name };
}
var TimeZonePicker = /* @__PURE__ */ component("TimeZonePicker", function TimeZonePicker2(props, ref) {
  const { zones, at, locale: ownLocale, className, value, defaultValue, ...rest } = props;
  const canon = (v) => typeof v === "string" && v ? currentTimeZone(v) : v;
  const locale = useLocale(ownLocale);
  const labels = useSettings(words).labels;
  const [mine, setMine] = React.useState(null);
  React.useEffect(() => {
    try {
      const z = new Intl.DateTimeFormat().resolvedOptions().timeZone;
      setMine(z ? currentTimeZone(z) : null);
    } catch {
    }
  }, []);
  const atTime = at == null ? null : new Date(at).getTime();
  const zonesKey = zones ? [...new Set(zones.map(currentTimeZone))].join(",") : "";
  const infos = React.useMemo(() => {
    const moment = atTime == null ? /* @__PURE__ */ new Date() : new Date(atTime);
    const collator = new Intl.Collator(locale);
    const list = zonesKey ? zonesKey.split(",") : allTimeZones();
    return list.map((z) => timeZoneInfo(z, locale, moment)).filter((x) => !!x).sort((a, b) => a.offset - b.offset || collator.compare(a.city, b.city));
  }, [locale, atTime, zonesKey]);
  const byZone = React.useMemo(() => new Map(infos.map((i) => [i.zone, i])), [infos]);
  const options = React.useMemo(() => {
    const own = mine ? byZone.get(mine) : void 0;
    const ordered = own ? [own, ...infos.filter((i) => i !== own)] : infos;
    return ordered.map((i) => ({
      value: i.zone,
      label: i.city,
      description: i === own ? `${i.offsetText} \xB7 ${labels.timeZoneYours}` : i.name ? `${i.offsetText} \xB7 ${i.name}` : i.offsetText
    }));
  }, [infos, byZone, mine, labels]);
  const filter = React.useCallback((o, text) => {
    const i = byZone.get(o.value), t = fold(text.trim());
    if (!i || !t) return true;
    const m = /^(?:utc|gmt)?\s*([+\-−])\s*(\d{1,2})(?::?(\d{2}))?$/.exec(t);
    if (m) return i.offset === (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0));
    return [i.city, i.name, i.zone.replace(/_/g, " "), oldName(i.zone).replace(/_/g, " "), ALSO[i.zone] || "", i.offsetText].some((s) => s && fold(s).includes(t));
  }, [byZone]);
  return /* @__PURE__ */ React.createElement(
    Combobox,
    {
      ...rest,
      ref,
      className: cn("dk-time-zone-picker", className),
      options,
      filter,
      ...value !== void 0 ? { value: canon(value) } : null,
      ...defaultValue !== void 0 ? { defaultValue: canon(defaultValue) } : null
    }
  );
});
export {
  TimeZonePicker,
  allTimeZones,
  timeZoneInfo
};
//# sourceMappingURL=TimeZonePicker.js.map
