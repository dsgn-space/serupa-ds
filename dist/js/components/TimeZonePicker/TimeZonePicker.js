"use client";

// src/components/TimeZonePicker/TimeZonePicker.tsx
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { fold } from "../../internal/fold.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { Combobox } from "../Combobox/Combobox.js";
import { en as words } from "./labels.js";
var part = (f, d) => f.formatToParts(d).find((p) => p.type === "timeZoneName")?.value || "";
function allTimeZones() {
  const list = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return list.includes("UTC") ? list.slice() : ["UTC", ...list];
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
  const { zones, at, locale: ownLocale, className, ...rest } = props;
  const locale = useLocale(ownLocale);
  const labels = useSettings(words).labels;
  const [mine, setMine] = React.useState(null);
  React.useEffect(() => {
    try {
      setMine(new Intl.DateTimeFormat().resolvedOptions().timeZone || null);
    } catch {
    }
  }, []);
  const atTime = at == null ? null : new Date(at).getTime();
  const zonesKey = zones ? zones.join(",") : "";
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
    return [i.city, i.name, i.zone.replace(/_/g, " "), i.offsetText].some((s) => fold(s).includes(t));
  }, [byZone]);
  return /* @__PURE__ */ React.createElement(Combobox, { ...rest, ref, className: cn("dk-time-zone-picker", className), options, filter });
});
export {
  TimeZonePicker,
  allTimeZones,
  timeZoneInfo
};
//# sourceMappingURL=TimeZonePicker.js.map
