"use client";

// src/internal/keys.ts
import * as React from "react";
import { useSettings } from "./provider.js";
var isApple = () => typeof navigator !== "undefined" && [navigator.userAgentData?.platform, navigator.platform, navigator.userAgent].some((s) => /Mac|iPhone|iPad|iPod/.test(s || ""));
var still = () => () => {
};
var never = () => false;
function useApple() {
  const platform = useSettings().platform;
  const found = React.useSyncExternalStore(still, isApple, never);
  return platform ? platform === "apple" : found;
}
var SHOWN = {
  mod: ["\u2318", "Ctrl"],
  cmd: ["\u2318", "Win"],
  meta: ["\u2318", "Win"],
  ctrl: ["\u2303", "Ctrl"],
  control: ["\u2303", "Ctrl"],
  alt: ["\u2325", "Alt"],
  option: ["\u2325", "Alt"],
  shift: ["\u21E7", "Shift"],
  enter: ["\u21B5", "Enter"],
  return: ["\u21B5", "Enter"],
  backspace: ["\u232B", "Backspace"],
  delete: ["\u2326", "Del"],
  esc: ["Esc", "Esc"],
  escape: ["Esc", "Esc"],
  tab: ["\u21E5", "Tab"],
  space: ["Space", "Space"],
  up: ["\u2191", "\u2191"],
  down: ["\u2193", "\u2193"],
  left: ["\u2190", "\u2190"],
  right: ["\u2192", "\u2192"]
};
function keyShown(k, apple) {
  const n = SHOWN[k === " " ? "space" : k.toLowerCase().replace(/^arrow/, "")];
  return n ? n[apple ? 0 : 1] : k.length === 1 ? k.toUpperCase() : k;
}
var ORDER = { ctrl: [0, 0], control: [0, 0], mod: [3, 0], alt: [1, 1], option: [1, 1], shift: [2, 2], cmd: [3, 3], meta: [3, 3] };
function shortcutShown(keys, apple) {
  const at = (k) => {
    const o = ORDER[k.toLowerCase()];
    return o ? o[apple ? 0 : 1] : 9;
  };
  return keys.map((k, i) => [at(k), i, k]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => keyShown(x[2], apple)).join(apple ? "" : "+");
}
export {
  isApple,
  keyShown,
  shortcutShown,
  useApple
};
//# sourceMappingURL=keys.js.map
