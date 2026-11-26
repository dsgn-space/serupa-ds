"use client";

// src/components/KeyboardShortcuts/KeyboardShortcuts.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { characterKey, current, none, on, parse, setSingleKeys, singleKeysOn, useShortcut, watch } from "../../internal/shortcuts.js";
import { Dialog } from "../Dialog/Dialog.js";
import { Kbd } from "../Kbd/Kbd.js";
import { Switch } from "../Switch/Switch.js";
import { DescriptionItem, DescriptionList } from "../DescriptionList/DescriptionList.js";
import { en as words } from "./labels.js";
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
  return /* @__PURE__ */ React.createElement(DescriptionItem, { key: i, className: "srp-keyboard-shortcuts__row", term: s_0.description }, /* @__PURE__ */ React.createElement(Kbd, { keys: s_0.keys }));
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
