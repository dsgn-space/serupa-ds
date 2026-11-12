"use client";

// src/internal/media.ts
import * as React from "react";
var BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
var lists = /* @__PURE__ */ new Map();
function mediaList(query) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  let m = lists.get(query);
  if (!m) {
    if (lists.size > 100) lists.clear();
    m = window.matchMedia(query);
    lists.set(query, m);
  }
  return m;
}
function useMediaQuery(query, options) {
  const server = !!(options && options.serverValue);
  const subscribe = React.useCallback((on) => {
    const m = mediaList(query);
    if (!m) return () => {
    };
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  const get = () => {
    const m = mediaList(query);
    return m ? m.matches : server;
  };
  return React.useSyncExternalStore(subscribe, get, () => server);
}
function useBreakpoint(name, options) {
  return useMediaQuery("(min-width: " + BREAKPOINTS[name] + "px)", options);
}
function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
export {
  BREAKPOINTS,
  useBreakpoint,
  useMediaQuery,
  useReducedMotion
};
//# sourceMappingURL=media.js.map
