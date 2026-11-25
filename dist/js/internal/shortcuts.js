// src/internal/shortcuts.ts
import * as React from "react";
import { useSettings } from "./provider.js";
import { isComposing } from "./ime.js";
import { warnOnce } from "./warn.js";
import { topModal } from "./layers.js";
import { isApple } from "../components/Kbd/Kbd.js";
import { en as words } from "../components/KeyboardShortcuts/labels.js";
var NAMED = {
  esc: "Escape",
  escape: "Escape",
  enter: "Enter",
  return: "Enter",
  space: " ",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  home: "Home",
  end: "End",
  pageup: "PageUp",
  pgup: "PageUp",
  pagedown: "PageDown",
  pgdn: "PageDown",
  insert: "Insert",
  ins: "Insert"
};
var MODIFIER = {
  mod: "mod",
  cmd: "meta",
  meta: "meta",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  shift: "shift"
};
function parse(keys) {
  const c = { key: "", mod: false, ctrl: false, meta: false, alt: false, shift: false };
  let n = 0;
  for (const k of keys) {
    const name = k.length > 1 ? k.toLowerCase().replace(/[\s_-]/g, "") : k.toLowerCase();
    const m = MODIFIER[name];
    if (m) c[m] = true;
    else {
      c.key = NAMED[name] || (k.length === 1 ? k.toLowerCase() : k);
      n++;
    }
  }
  return n === 1 ? c : null;
}
function matches(c, e, apple) {
  if (e.ctrlKey !== (c.ctrl || c.mod && !apple) || e.metaKey !== (c.meta || c.mod && apple) || e.altKey !== c.alt) return false;
  const symbol = c.key.length === 1 && !/[a-z0-9 ]/.test(c.key);
  if (!symbol && e.shiftKey !== c.shift) return false;
  if ((e.key.length === 1 ? e.key.toLowerCase() : e.key) === c.key) return true;
  return /^[a-z]$/.test(c.key) ? !/^[\x20-\x7e]$/.test(e.key) && e.code === "Key" + c.key.toUpperCase() : /^[0-9]$/.test(c.key) ? e.code === "Digit" + c.key : false;
}
var NOT_TYPED = /^(checkbox|radio|button|submit|reset|range|color|file|image)$/;
var typing = (t) => t instanceof HTMLElement && (t.isContentEditable || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.tagName === "INPUT" && !NOT_TYPED.test(t.type));
var entries = [];
var watchers = /* @__PURE__ */ new Set();
var NONE = [];
var changed = () => watchers.forEach((w) => w());
function onKey(e) {
  if (e.defaultPrevented || isComposing(e) || topModal()) return;
  for (const x of [...entries].reverse()) {
    if (!matches(x, e, x.apple)) continue;
    if (characterKey(x) && !singleKeysOn()) continue;
    if (typing(e.composedPath()[0] || e.target) && !x.inInputs && !x.mod && !x.ctrl && !x.meta) continue;
    e.preventDefault();
    x.run.current(e);
    return;
  }
}
function add(x) {
  if (!entries.length) document.addEventListener("keydown", onKey);
  entries = entries.concat(x);
  changed();
  return () => {
    entries = entries.filter((y) => y !== x);
    if (!entries.length) document.removeEventListener("keydown", onKey);
    changed();
  };
}
var watch = (w) => {
  watchers.add(w);
  return () => {
    watchers.delete(w);
  };
};
var current = () => entries;
var none = () => NONE;
var SINGLE_KEYS_KEY = "serupa-single-key-shortcuts";
var single;
function singleKeysOn() {
  if (single === void 0) {
    try {
      single = localStorage.getItem(SINGLE_KEYS_KEY) !== "off";
    } catch {
      single = true;
    }
  }
  return single;
}
function setSingleKeys(on2) {
  single = on2;
  try {
    if (on2) localStorage.removeItem(SINGLE_KEYS_KEY);
    else localStorage.setItem(SINGLE_KEYS_KEY, "off");
  } catch {
  }
  changed();
}
var kept = (c) => (c.mod || c.ctrl || c.meta) && !c.alt && /^([ntwq]|Tab)$/.test(c.key);
var characterKey = (c) => c.key.length === 1 && !c.mod && !c.ctrl && !c.meta && !c.alt;
var on = () => true;
function useShortcut(keys, handler, options) {
  const sds = useSettings(words);
  const run = React.useRef(handler);
  React.useEffect(() => {
    run.current = handler;
  });
  const list = typeof keys === "string" ? [keys] : keys;
  const id = JSON.stringify(list);
  const { description, group, enabled = true, inInputs = false } = options || {};
  const apple = sds.platform ? sds.platform === "apple" : null;
  React.useEffect(() => {
    if (!enabled) return;
    const k = JSON.parse(id), combo = parse(k);
    if (!combo) {
      if (process.env.NODE_ENV !== "production") warnOnce("shortcut-keys", `useShortcut: ${id} isn't one key with its modifiers, so it's not set up. Give one key, plus mod, ctrl, cmd, alt or shift if it needs them, such as ["mod", "K"].`, "shortcut-keys" + id);
      return;
    }
    if (process.env.NODE_ENV !== "production" && kept(combo)) warnOnce("browser-shortcut", `useShortcut: ${id} is a key the browser keeps for itself (a new window or tab, closing it, quitting, switching tabs), so the page never hears it. Choose other keys, such as ["mod", "shift", "K"], or ["alt", "N"] for "new".`, "browser-shortcut" + id);
    return add(Object.assign(combo, { keys: k, run, description, group, inInputs, apple: apple != null ? apple : isApple() }));
  }, [id, description, group, enabled, inInputs, apple]);
}
export {
  characterKey,
  current,
  none,
  on,
  parse,
  setSingleKeys,
  singleKeysOn,
  useShortcut,
  watch
};
//# sourceMappingURL=shortcuts.js.map
