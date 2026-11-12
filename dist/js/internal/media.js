"use client";

// src/internal/media.ts
import * as React from "react";
import { REDUCED_MOTION, REDUCE_ATTR, mediaList, reducedMotion } from "./mediaList.js";
var BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
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
function prefersReducedMotion(el) {
  return reducedMotion(el);
}
var attrListeners = /* @__PURE__ */ new Set();
var attrWatch = null;
function watchAttr(on) {
  attrListeners.add(on);
  if (!attrWatch && typeof MutationObserver === "function") {
    attrWatch = new MutationObserver(() => attrListeners.forEach((fn) => fn()));
    attrWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  }
  return () => {
    attrListeners.delete(on);
    if (!attrListeners.size && attrWatch) {
      attrWatch.disconnect();
      attrWatch = null;
    }
  };
}
function useReducedMotion() {
  const system = useMediaQuery(REDUCED_MOTION);
  const app = React.useSyncExternalStore(watchAttr, () => document.documentElement.matches(REDUCE_ATTR), () => false);
  return system || app;
}
export {
  BREAKPOINTS,
  prefersReducedMotion,
  useBreakpoint,
  useMediaQuery,
  useReducedMotion
};
//# sourceMappingURL=media.js.map
