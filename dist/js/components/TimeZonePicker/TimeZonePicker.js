"use client";

// src/components/TimeZonePicker/TimeZonePicker.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { fold } from "../../internal/fold.js";
import { isolate } from "../../internal/bidi.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { localeDir } from "../../internal/locale.js";
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
    listed = new Intl.DateTimeFormat("en-US", {
      timeZone: zone
    }).resolvedOptions().timeZone || zone;
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
    f = new Intl.DateTimeFormat(locale, {
      timeZone: zone,
      timeZoneName
    });
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
  return {
    zone,
    city,
    offset,
    offsetText,
    name: /^(GMT|UTC)([+\-−]|$)/.test(name) ? "" : name
  };
}
var never = () => () => {
};
var noZone = () => null;
function ownZone() {
  try {
    const z = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    return z ? currentTimeZone(z) : null;
  } catch {
    return null;
  }
}
function TimeZonePickerRender(t0) {
  const $ = _c(40);
  const {
    ref,
    ...props
  } = t0;
  const {
    zones,
    at,
    locale: ownLocale,
    className,
    value,
    defaultValue,
    ...rest
  } = props;
  const canon = _temp;
  const locale = useLocale(ownLocale);
  const dir = ownLocale ? localeDir(ownLocale) : void 0;
  const labels = useSettings(words).labels;
  const mine = React.useSyncExternalStore(never, ownZone, noZone);
  const atTime = at == null ? null : Number(new Date(at));
  const zonesKey = zones ? [...new Set(zones.map(currentTimeZone))].join(",") : "";
  const chosen = canon(value !== void 0 ? value : defaultValue);
  const [woken, setWoken] = React.useState(!!props.defaultOpen);
  const full = woken || !!props.open;
  let t1;
  if ($[0] !== woken) {
    t1 = () => {
      if (!woken) {
        setWoken(true);
      }
    };
    $[0] = woken;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const wake = t1;
  const zoneList = zonesKey || (full ? "" : [chosen, mine].filter(_temp2).join(","));
  let t2;
  if ($[2] !== atTime || $[3] !== full || $[4] !== locale || $[5] !== zoneList || $[6] !== zonesKey) {
    const moment = atTime == null ? /* @__PURE__ */ new Date() : new Date(atTime);
    const collator = new Intl.Collator(locale);
    const list = zoneList ? zoneList.split(",") : full || zonesKey ? allTimeZones() : [];
    t2 = list.map((z_0) => timeZoneInfo(z_0, locale, moment)).filter(_temp3).sort((a, b) => a.offset - b.offset || collator.compare(a.city, b.city));
    $[2] = atTime;
    $[3] = full;
    $[4] = locale;
    $[5] = zoneList;
    $[6] = zonesKey;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  const infos = t2;
  let t3;
  if ($[8] !== infos) {
    t3 = new Map(infos.map(_temp4));
    $[8] = infos;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  const byZone = t3;
  let t4;
  if ($[10] !== byZone || $[11] !== mine) {
    t4 = mine ? byZone.get(mine) : void 0;
    $[10] = byZone;
    $[11] = mine;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  const own = t4;
  let t5;
  if ($[13] !== infos || $[14] !== own) {
    t5 = own ? [own, ...infos.filter((i_0) => i_0 !== own)] : infos;
    $[13] = infos;
    $[14] = own;
    $[15] = t5;
  } else {
    t5 = $[15];
  }
  const ordered = t5;
  let t6;
  if ($[16] !== dir || $[17] !== labels.timeZoneYours || $[18] !== ordered || $[19] !== own) {
    let t72;
    if ($[21] !== dir || $[22] !== labels.timeZoneYours || $[23] !== own) {
      t72 = (i_1) => ({
        value: i_1.zone,
        label: i_1.city,
        description: i_1 === own ? `${i_1.offsetText} \xB7 ${labels.timeZoneYours}` : i_1.name ? isolate(`${i_1.offsetText} \xB7 ${i_1.name}`, dir) : i_1.offsetText
      });
      $[21] = dir;
      $[22] = labels.timeZoneYours;
      $[23] = own;
      $[24] = t72;
    } else {
      t72 = $[24];
    }
    t6 = ordered.map(t72);
    $[16] = dir;
    $[17] = labels.timeZoneYours;
    $[18] = ordered;
    $[19] = own;
    $[20] = t6;
  } else {
    t6 = $[20];
  }
  const options = t6;
  let t7;
  if ($[25] !== byZone) {
    t7 = (o, text) => {
      const i_2 = byZone.get(o.value);
      const t = fold(text.trim());
      if (!i_2 || !t) {
        return true;
      }
      const m = /^(?:utc|gmt)?\s*([+\-−])\s*(\d{1,2})(?::?(\d{2}))?$/.exec(t);
      if (m) {
        return i_2.offset === (m[1] === "+" ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3] || 0));
      }
      return [i_2.city, i_2.name, i_2.zone.replace(/_/g, " "), oldName(i_2.zone).replace(/_/g, " "), ALSO[i_2.zone] || "", i_2.offsetText].some((s) => s && fold(s).includes(t));
    };
    $[25] = byZone;
    $[26] = t7;
  } else {
    t7 = $[26];
  }
  const filter = t7;
  const T0 = Combobox;
  const t8 = labels.timeZonePlaceholder;
  const t9 = cn("srp-time-zone-picker", className);
  const t10 = (e) => {
    wake();
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };
  const t11 = (e_0) => {
    wake();
    if (rest.onPointerEnter) {
      rest.onPointerEnter(e_0);
    }
  };
  const t12 = (open, details) => {
    if (open) {
      wake();
    }
    if (rest.onOpenChange) {
      rest.onOpenChange(open, details);
    }
  };
  const t13 = value !== void 0 ? {
    value: canon(value)
  } : null;
  const t14 = defaultValue !== void 0 ? {
    defaultValue: canon(defaultValue)
  } : null;
  let t15;
  if ($[27] !== T0 || $[28] !== filter || $[29] !== labels.timeZonePlaceholder || $[30] !== options || $[31] !== ref || $[32] !== rest || $[33] !== t10 || $[34] !== t11 || $[35] !== t12 || $[36] !== t13 || $[37] !== t14 || $[38] !== t9) {
    t15 = /* @__PURE__ */ React.createElement(T0, { placeholder: t8, ...rest, ref, className: t9, options, filter, onFocus: t10, onPointerEnter: t11, onOpenChange: t12, ...t13, ...t14 });
    $[27] = T0;
    $[28] = filter;
    $[29] = labels.timeZonePlaceholder;
    $[30] = options;
    $[31] = ref;
    $[32] = rest;
    $[33] = t10;
    $[34] = t11;
    $[35] = t12;
    $[36] = t13;
    $[37] = t14;
    $[38] = t9;
    $[39] = t15;
  } else {
    t15 = $[39];
  }
  return t15;
}
function _temp4(i) {
  return [i.zone, i];
}
function _temp3(x) {
  return !!x;
}
function _temp2(z) {
  return !!z;
}
function _temp(v) {
  return typeof v === "string" && v ? currentTimeZone(v) : v;
}
var TimeZonePicker = /* @__PURE__ */ named("TimeZonePicker", TimeZonePickerRender);
export {
  TimeZonePicker,
  allTimeZones,
  timeZoneInfo
};
//# sourceMappingURL=TimeZonePicker.js.map
