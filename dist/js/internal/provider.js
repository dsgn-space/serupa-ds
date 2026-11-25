"use client";

// src/internal/provider.tsx
import { c as _c } from "./memoCache.js";
import * as React from "react";
import { ControlSize } from "./controlSize.js";
import { isIconData } from "../icons.js";
import { DEFAULT_LABELS, SHARED_LABELS } from "./labels.js";
import { canonicalLocale } from "./locale.js";
import { warnOnce } from "./warn.js";
function packFor(packs, locale) {
  const want = locale && canonicalLocale(locale)?.toLowerCase();
  if (!want) return void 0;
  const tag = (p) => canonicalLocale(p.locale)?.toLowerCase();
  return packs.find((p) => tag(p) === want) ?? packs.find((p) => tag(p)?.split("-")[0] === want.split("-")[0]);
}
var NONE = {
  locale: void 0,
  labels: SHARED_LABELS,
  icons: /* @__PURE__ */ new Map(),
  platform: void 0,
  languages: void 0
};
var Context = /* @__PURE__ */ React.createContext(NONE);
function SerupaProvider(props) {
  const $ = _c(23);
  const outer = React.useContext(Context);
  const {
    locale,
    platform
  } = props;
  const labels = useSameAsBefore(props.labels, 0);
  const icons = useSameAsBefore(props.icons, 1);
  const languages = useSameAsBefore(props.languages, 0);
  let merged;
  let packs;
  if ($[0] !== labels || $[1] !== languages || $[2] !== locale || $[3] !== outer.labels || $[4] !== outer.languages || $[5] !== outer.locale) {
    merged = {
      ...outer.labels
    };
    packs = languages ?? outer.languages;
    const pack = (locale || languages) && packs ? packFor(packs, locale || outer.locale) : void 0;
    for (const set of [pack?.labels, labels]) {
      if (set) {
        for (const k of Object.keys(set)) {
          const v = set[k];
          if (v != null && v !== "") {
            merged[k] = v;
          }
        }
      }
    }
    $[0] = labels;
    $[1] = languages;
    $[2] = locale;
    $[3] = outer.labels;
    $[4] = outer.languages;
    $[5] = outer.locale;
    $[6] = merged;
    $[7] = packs;
  } else {
    merged = $[6];
    packs = $[7];
  }
  let map = outer.icons;
  if (icons) {
    let m;
    if ($[8] !== icons || $[9] !== outer.icons) {
      m = new Map(outer.icons);
      for (const x of Array.isArray(icons) ? icons : [icons]) {
        if (isIconData(x)) {
          m.set(x.name, x);
        } else {
          for (const v_0 of Object.values(x)) {
            if (isIconData(v_0)) {
              m.set(v_0.name, v_0);
            }
          }
        }
      }
      $[8] = icons;
      $[9] = outer.icons;
      $[10] = m;
    } else {
      m = $[10];
    }
    map = m;
  }
  const t0 = locale || outer.locale;
  const t1 = platform === "apple" || platform === "other" ? platform : outer.platform;
  let t2;
  if ($[11] !== map || $[12] !== merged || $[13] !== packs || $[14] !== t0 || $[15] !== t1) {
    t2 = {
      locale: t0,
      labels: merged,
      icons: map,
      platform: t1,
      languages: packs
    };
    $[11] = map;
    $[12] = merged;
    $[13] = packs;
    $[14] = t0;
    $[15] = t1;
    $[16] = t2;
  } else {
    t2 = $[16];
  }
  const value = t2;
  const size = props.size === "sm" || props.size === "md" || props.size === "lg" ? props.size : void 0;
  let t3;
  if ($[17] !== props.children || $[18] !== value) {
    t3 = /* @__PURE__ */ React.createElement(Context.Provider, { value }, props.children);
    $[17] = props.children;
    $[18] = value;
    $[19] = t3;
  } else {
    t3 = $[19];
  }
  const inner = t3;
  let t4;
  if ($[20] !== inner || $[21] !== size) {
    t4 = size ? /* @__PURE__ */ React.createElement(ControlSize.Provider, { value: size }, inner) : inner;
    $[20] = inner;
    $[21] = size;
    $[22] = t4;
  } else {
    t4 = $[22];
  }
  return t4;
}
SerupaProvider.displayName = "SerupaProvider";
function same(a, b, depth) {
  if (a === b) return true;
  if (!a || !b || typeof a != "object" || typeof b != "object") return false;
  if (Array.isArray(a) != Array.isArray(b) || Array.isArray(a) && a.length != b.length) return false;
  const x = a, y = b;
  return [.../* @__PURE__ */ new Set([...Object.keys(x), ...Object.keys(y)])].every((k) => depth ? same(x[k], y[k], depth - 1) : x[k] === y[k]);
}
function useSameAsBefore(v, depth) {
  const $ = _c(2);
  let t0;
  if ($[0] !== v) {
    t0 = () => v;
    $[0] = v;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const [kept, setKept] = React.useState(t0);
  if (same(kept, v, depth)) {
    return kept;
  }
  setKept(() => v);
  return v;
}
function useSettings(own) {
  const $ = _c(3);
  const settings = React.useContext(Context);
  let t0;
  if ($[0] !== own || $[1] !== settings) {
    t0 = own ? {
      ...settings,
      labels: Object.assign({}, own, settings.labels)
    } : settings;
    $[0] = own;
    $[1] = settings;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
function useSerupa() {
  const $ = _c(7);
  const settings = React.useContext(Context);
  const t0 = settings.locale;
  let t1;
  if ($[0] !== settings.labels) {
    t1 = Object.assign({}, DEFAULT_LABELS, settings.labels);
    $[0] = settings.labels;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== settings.icons || $[3] !== settings.locale || $[4] !== settings.platform || $[5] !== t1) {
    t2 = {
      locale: t0,
      labels: t1,
      icons: settings.icons,
      platform: settings.platform
    };
    $[2] = settings.icons;
    $[3] = settings.locale;
    $[4] = settings.platform;
    $[5] = t1;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  return t2;
}
var SERVER_LOCALE = "en-US";
var seenLocale;
var told = /* @__PURE__ */ new Set();
var listening = false;
var listen = () => {
  if (listening) return;
  listening = true;
  window.addEventListener("languagechange", () => {
    seenLocale = void 0;
    told.forEach((cb) => cb());
  });
};
var browserLocale = () => {
  if (seenLocale === void 0) {
    seenLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
    listen();
  }
  return seenLocale;
};
var onLanguageChange = (cb) => {
  listen();
  told.add(cb);
  return () => {
    told.delete(cb);
  };
};
function usable(locale) {
  if (!locale) return void 0;
  const ok = canonicalLocale(locale);
  if (!ok && process.env.NODE_ENV !== "production") warnOnce("bad-locale", `Serupa: "${locale}" isn't a locale Intl can read, so it's ignored. Use a BCP 47 tag such as "en-US" or "id-ID".`, "bad-locale:" + locale);
  return ok;
}
function useLocale(own) {
  const $ = _c(4);
  const fromProvider = React.useContext(Context).locale;
  const browser = React.useSyncExternalStore(onLanguageChange, browserLocale, _temp);
  if (process.env.NODE_ENV !== "production" && !own && !fromProvider && typeof window === "undefined") {
    warnOnce("server-locale", `Serupa: rendered on the server without a locale, so dates and numbers are ${SERVER_LOCALE} until hydration, then the browser's. Set <SerupaProvider locale> from the request.`);
  }
  let t0;
  if ($[0] !== browser || $[1] !== fromProvider || $[2] !== own) {
    t0 = usable(own) || usable(fromProvider) || browser;
    $[0] = browser;
    $[1] = fromProvider;
    $[2] = own;
    $[3] = t0;
  } else {
    t0 = $[3];
  }
  return t0;
}
function _temp() {
  return SERVER_LOCALE;
}
function useOwnLang(own) {
  const $ = _c(3);
  const base = useLocale();
  let t0;
  if ($[0] !== base || $[1] !== own) {
    const mine = own ? canonicalLocale(own) : void 0;
    t0 = mine && mine.toLowerCase() !== base.toLowerCase() ? mine : void 0;
    $[0] = base;
    $[1] = own;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  return t0;
}
export {
  SerupaProvider,
  useLocale,
  useOwnLang,
  useSerupa,
  useSettings
};
//# sourceMappingURL=provider.js.map
