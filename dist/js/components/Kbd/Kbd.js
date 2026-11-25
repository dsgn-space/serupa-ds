"use client";

// src/components/Kbd/Kbd.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { en as words } from "./labels.js";
import { useApple } from "../../internal/keys.js";
import { isApple } from "../../internal/keys.js";
var NAMED = {
  mod: ["\u2318", "Command", "Ctrl", "Control"],
  cmd: ["\u2318", "Command", "\u229E", "Windows"],
  meta: ["\u2318", "Command", "\u229E", "Windows"],
  ctrl: ["\u2303", "Control", "Ctrl", "Control"],
  control: ["\u2303", "Control", "Ctrl", "Control"],
  alt: ["\u2325", "Option", "Alt", "Alt"],
  option: ["\u2325", "Option", "Alt", "Alt"],
  shift: ["\u21E7", "Shift", "Shift", "Shift"],
  enter: ["\u21B5", "Enter", "Enter", "Enter"],
  return: ["\u21B5", "Return", "Enter", "Enter"],
  backspace: ["\u232B", "Backspace", "Backspace", "Backspace"],
  delete: ["\u2326", "Delete", "Del", "Delete"],
  esc: ["Esc", "Escape", "Esc", "Escape"],
  escape: ["Esc", "Escape", "Esc", "Escape"],
  tab: ["\u21E5", "Tab", "Tab", "Tab"],
  space: ["Space", "Space", "Space", "Space"],
  up: ["\u2191", "Up arrow", "\u2191", "Up arrow"],
  down: ["\u2193", "Down arrow", "\u2193", "Down arrow"],
  left: ["\u2190", "Left arrow", "\u2190", "Left arrow"],
  right: ["\u2192", "Right arrow", "\u2192", "Right arrow"],
  // KeyboardEvent.key's names, as useShortcut takes them (L8E57).
  arrowup: ["\u2191", "Up arrow", "\u2191", "Up arrow"],
  arrowdown: ["\u2193", "Down arrow", "\u2193", "Down arrow"],
  arrowleft: ["\u2190", "Left arrow", "\u2190", "Left arrow"],
  arrowright: ["\u2192", "Right arrow", "\u2192", "Right arrow"],
  home: ["\u2196", "Home", "Home", "Home"],
  end: ["\u2198", "End", "End", "End"],
  pageup: ["\u21DE", "Page Up", "PgUp", "Page Up"],
  pgup: ["\u21DE", "Page Up", "PgUp", "Page Up"],
  pagedown: ["\u21DF", "Page Down", "PgDn", "Page Down"],
  pgdn: ["\u21DF", "Page Down", "PgDn", "Page Down"],
  capslock: ["\u21EA", "Caps Lock", "Caps Lock", "Caps Lock"],
  insert: ["Ins", "Insert", "Ins", "Insert"],
  ins: ["Ins", "Insert", "Ins", "Insert"],
  fn: ["fn", "Function", "Fn", "Function"]
};
function Key(t0) {
  const $ = _c(13);
  const {
    k,
    apple,
    say
  } = t0;
  const n = NAMED[k === " " ? "space" : k.length > 1 ? k.toLowerCase().replace(/[\s_-]/g, "") : k.toLowerCase()];
  if (!n) {
    let t12;
    if ($[0] !== k) {
      t12 = k.length === 1 ? k.toUpperCase() : k;
      $[0] = k;
      $[1] = t12;
    } else {
      t12 = $[1];
    }
    let t22;
    if ($[2] !== t12) {
      t22 = /* @__PURE__ */ React.createElement("kbd", { className: "srp-kbd__key" }, t12);
      $[2] = t12;
      $[3] = t22;
    } else {
      t22 = $[3];
    }
    return t22;
  }
  const shown = apple ? n[0] : n[2];
  const t1 = apple ? n[1] : n[3];
  let t2;
  if ($[4] !== say || $[5] !== t1) {
    t2 = say(t1);
    $[4] = say;
    $[5] = t1;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  const name = t2;
  const t3 = shown === name ? void 0 : name;
  let t4;
  if ($[7] !== name || $[8] !== shown) {
    t4 = shown === name ? shown : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, shown), /* @__PURE__ */ React.createElement(VisuallyHidden, null, name));
    $[7] = name;
    $[8] = shown;
    $[9] = t4;
  } else {
    t4 = $[9];
  }
  let t5;
  if ($[10] !== t3 || $[11] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("kbd", { className: "srp-kbd__key", title: t3 }, t4);
    $[10] = t3;
    $[11] = t4;
    $[12] = t5;
  } else {
    t5 = $[12];
  }
  return t5;
}
function KbdRender(t0) {
  const $ = _c(9);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    keys: 1,
    size: 1,
    className: 1,
    children: 1
  });
  const sds = useSettings(words);
  const say = sds.labels.keyName;
  const apple = useApple();
  const size = props.size === "sm" ? "sm" : "md";
  const keys = props.keys && props.keys.length ? props.keys : typeof props.children === "string" ? [props.children] : null;
  const cls = cn("srp-kbd", "srp-kbd--size-" + size, props.className);
  if (!keys) {
    return /* @__PURE__ */ React.createElement("kbd", { ...rest, ref, className: cn(cls, "srp-kbd--single"), "data-component": "kbd", "data-size": size }, /* @__PURE__ */ React.createElement("kbd", { className: "srp-kbd__key" }, props.children));
  }
  const t1 = cn(cls, keys.length === 1 && "srp-kbd--single");
  const t2 = "kbd";
  let t3;
  if ($[0] !== apple || $[1] !== say) {
    t3 = (k, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, i > 0 ? /* @__PURE__ */ React.createElement("span", { className: "srp-kbd__plus", "aria-hidden": true }, "+") : null, /* @__PURE__ */ React.createElement(Key, { k, apple, say }));
    $[0] = apple;
    $[1] = say;
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const t4 = keys.map(t3);
  let t5;
  if ($[3] !== ref || $[4] !== rest || $[5] !== size || $[6] !== t1 || $[7] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("kbd", { ...rest, ref, className: t1, "data-component": t2, "data-size": size }, t4);
    $[3] = ref;
    $[4] = rest;
    $[5] = size;
    $[6] = t1;
    $[7] = t4;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  return t5;
}
var Kbd = /* @__PURE__ */ named("Kbd", KbdRender);
export {
  Kbd,
  isApple
};
//# sourceMappingURL=Kbd.js.map
