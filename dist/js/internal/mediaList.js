// src/internal/mediaList.ts
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
var REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
var REDUCE_ATTR = '[data-motion="reduce"]';
function reducedMotion(el) {
  if (typeof document === "undefined") return false;
  const m = mediaList(REDUCED_MOTION);
  if (m && m.matches) return true;
  const at = el && el.isConnected ? el : document.documentElement;
  return !!(at && at.closest(REDUCE_ATTR));
}
export {
  REDUCED_MOTION,
  REDUCE_ATTR,
  mediaList,
  reducedMotion
};
//# sourceMappingURL=mediaList.js.map
