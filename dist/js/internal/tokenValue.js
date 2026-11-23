"use client";

// src/internal/tokenValue.ts
import * as React from "react";
import { mediaList } from "./mediaList.js";
var THEME_ATTRS = ["data-theme", "data-brand", "data-mode", "data-contrast", "data-radius", "data-density"];
var THEME_MEDIA = ["(prefers-color-scheme: dark)", "(prefers-contrast: more)", "(forced-colors: active)"];
var cssName = (name) => name.startsWith("--") ? name : "--" + name;
function tokenValue(name, element) {
  if (typeof document === "undefined") return "";
  const el = element || document.documentElement;
  const raw = getComputedStyle(el).getPropertyValue(cssName(name)).trim();
  if (!raw || typeof CSS === "undefined" || !CSS.supports("color", raw)) return raw;
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;color:" + raw;
  el.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}
var listeners = /* @__PURE__ */ new Set();
var watch = null;
function onThemeChange(on) {
  listeners.add(on);
  if (!watch && typeof document !== "undefined") {
    const tell = () => listeners.forEach((fn) => fn());
    const observer = typeof MutationObserver === "function" ? new MutationObserver(tell) : null;
    if (observer) observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: THEME_ATTRS });
    const lists = THEME_MEDIA.map(mediaList).filter((m) => !!m);
    lists.forEach((m) => m.addEventListener("change", tell));
    watch = () => {
      if (observer) observer.disconnect();
      lists.forEach((m) => m.removeEventListener("change", tell));
    };
  }
  return () => {
    listeners.delete(on);
    if (!listeners.size && watch) {
      watch();
      watch = null;
    }
  };
}
function useTokenValue(name, ref) {
  const get = () => tokenValue(name, ref ? ref.current : null);
  return React.useSyncExternalStore(onThemeChange, get, () => "");
}
export {
  tokenValue,
  useTokenValue
};
//# sourceMappingURL=tokenValue.js.map
