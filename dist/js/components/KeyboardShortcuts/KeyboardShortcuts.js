"use client";

// src/components/KeyboardShortcuts/KeyboardShortcuts.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { isComposing } from "../../internal/ime.js";
import { warnOnce } from "../../internal/warn.js";
import { topModal } from "../../internal/layers.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Kbd, isApple } from "../Kbd/Kbd.js";
import { Switch } from "../Switch/Switch.js";
import { DescriptionItem, DescriptionList } from "../DescriptionList/DescriptionList.js";
import { en as words } from "./labels.js";
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
  const c = {
    key: "",
    mod: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false
  };
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
  const $ = _c(14);
  const sds = useSettings(words);
  const run = React.useRef(handler);
  let t0;
  if ($[0] !== handler) {
    t0 = () => {
      run.current = handler;
    };
    $[0] = handler;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  React.useEffect(t0);
  let t1;
  if ($[2] !== keys) {
    t1 = typeof keys === "string" ? [keys] : keys;
    $[2] = keys;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const list = t1;
  const id = JSON.stringify(list);
  let t2;
  if ($[4] !== options) {
    t2 = options || {};
    $[4] = options;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const {
    description,
    group,
    enabled: t3,
    inInputs: t4
  } = t2;
  const enabled = t3 === void 0 ? true : t3;
  const inInputs = t4 === void 0 ? false : t4;
  const apple = sds.platform ? sds.platform === "apple" : null;
  let t5;
  let t6;
  if ($[6] !== apple || $[7] !== description || $[8] !== enabled || $[9] !== group || $[10] !== id || $[11] !== inInputs) {
    t5 = () => {
      if (!enabled) {
        return;
      }
      const k = JSON.parse(id);
      const combo = parse(k);
      if (!combo) {
        if (process.env.NODE_ENV !== "production") {
          warnOnce("shortcut-keys", `useShortcut: ${id} isn't one key with its modifiers, so it's not set up. Give one key, plus mod, ctrl, cmd, alt or shift if it needs them, such as ["mod", "K"].`, "shortcut-keys" + id);
        }
        return;
      }
      if (process.env.NODE_ENV !== "production" && kept(combo)) {
        warnOnce("browser-shortcut", `useShortcut: ${id} is a key the browser keeps for itself (a new window or tab, closing it, quitting, switching tabs), so the page never hears it. Choose other keys, such as ["mod", "shift", "K"], or ["alt", "N"] for "new".`, "browser-shortcut" + id);
      }
      return add(Object.assign(combo, {
        keys: k,
        run,
        description,
        group,
        inInputs,
        apple: apple != null ? apple : isApple()
      }));
    };
    t6 = [id, description, group, enabled, inInputs, apple];
    $[6] = apple;
    $[7] = description;
    $[8] = enabled;
    $[9] = group;
    $[10] = id;
    $[11] = inInputs;
    $[12] = t5;
    $[13] = t6;
  } else {
    t5 = $[12];
    t6 = $[13];
  }
  React.useEffect(t5, t6);
}
function KeyboardShortcutsRender(t0) {
  const $ = _c(13);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const labels = sds.labels;
  const rest = omit(props, {
    title: 1,
    shortcuts: 1,
    helpKeys: 1,
    open: 1,
    defaultOpen: 1,
    onOpenChange: 1,
    className: 1
  });
  const [own, setOwn] = React.useState(!!props.defaultOpen);
  const open = props.open != null ? props.open : own;
  const {
    onOpenChange
  } = props;
  const change = (next, details) => {
    setOwn(next);
    if (onOpenChange) {
      onOpenChange(next, details);
    }
  };
  const help = props.helpKeys === false ? null : props.helpKeys && props.helpKeys.length ? props.helpKeys : ["?"];
  const t1 = !!help && !open;
  let t2;
  if ($[0] !== labels.showShortcuts || $[1] !== t1) {
    t2 = {
      description: labels.showShortcuts,
      enabled: t1
    };
    $[0] = labels.showShortcuts;
    $[1] = t1;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  useShortcut(help || [], () => change(true, {
    reason: "trigger"
  }), t2);
  const live = React.useSyncExternalStore(watch, current, none);
  const singleKeys = React.useSyncExternalStore(watch, singleKeysOn, on);
  const single1 = _temp;
  const hasSingle = !!help && single1(help) || live.some(characterKey) || (props.shortcuts || []).some((x) => single1(x.keys));
  const groups = /* @__PURE__ */ new Map();
  const seen = /* @__PURE__ */ new Set();
  for (const s of [...props.shortcuts || [], ...live.filter(_temp2), ...help && open ? [{
    keys: help,
    description: labels.showShortcuts
  }] : []]) {
    const name = s.group || labels.generalShortcuts;
    const key = JSON.stringify([name, s.keys, s.description]);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    groups.set(name, (groups.get(name) || []).concat({
      keys: s.keys,
      description: s.description || ""
    }));
  }
  const T0 = Dialog;
  const t3 = cn("srp-keyboard-shortcuts", props.className);
  const t4 = props.title != null ? props.title : labels.keyboardShortcuts;
  const t5 = hasSingle ? /* @__PURE__ */ React.createElement(Switch, { className: "srp-keyboard-shortcuts__single", checked: singleKeys, onCheckedChange: setSingleKeys, description: labels.singleKeyHint }, labels.singleKeyShortcuts) : void 0;
  const t7 = [...groups].map((t6) => {
    const [name_0, items] = t6;
    return /* @__PURE__ */ React.createElement("section", { key: name_0, className: "srp-keyboard-shortcuts__group" }, groups.size > 1 ? /* @__PURE__ */ React.createElement("h3", { className: "srp-keyboard-shortcuts__heading" }, name_0) : null, /* @__PURE__ */ React.createElement(DescriptionList, { layout: "split", className: "srp-keyboard-shortcuts__list" }, items.map(_temp3)));
  });
  let t8;
  if ($[3] !== T0 || $[4] !== change || $[5] !== open || $[6] !== ref || $[7] !== rest || $[8] !== t3 || $[9] !== t4 || $[10] !== t5 || $[11] !== t7) {
    t8 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, className: t3, title: t4, open, onOpenChange: change, footer: t5 }, t7);
    $[3] = T0;
    $[4] = change;
    $[5] = open;
    $[6] = ref;
    $[7] = rest;
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
    $[11] = t7;
    $[12] = t8;
  } else {
    t8 = $[12];
  }
  return t8;
}
function _temp3(s_0, i) {
  return /* @__PURE__ */ React.createElement(DescriptionItem, { key: i, className: "srp-keyboard-shortcuts__row", term: s_0.description }, /* @__PURE__ */ React.createElement(Kbd, { keys: s_0.keys, size: "sm" }));
}
function _temp2(x_0) {
  return x_0.description;
}
function _temp(keys) {
  const c = parse(keys);
  return !!c && characterKey(c);
}
var KeyboardShortcuts = /* @__PURE__ */ named("KeyboardShortcuts", KeyboardShortcutsRender);
export {
  KeyboardShortcuts,
  useShortcut
};
//# sourceMappingURL=KeyboardShortcuts.js.map
