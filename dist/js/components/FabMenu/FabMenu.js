"use client";

// src/components/FabMenu/FabMenu.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { oneOf } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { Fab } from "../Fab/Fab.js";
import { Menu, MenuItem } from "../Menu/Menu.js";
var POSITIONS = ["bottom-end", "bottom-start", "top-end", "top-start", "static"];
function FabMenuRender(t0) {
  const $ = _c(2);
  let t1;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      actions,
      open,
      onOpenChange,
      ...fab
    } = props;
    const pos = oneOf(POSITIONS, fab.placement, "bottom-end");
    const placement = (pos.startsWith("top") ? "bottom" : "top") + (pos.endsWith("start") ? "-start" : "-end");
    t1 = /* @__PURE__ */ React.createElement(Menu, { trigger: /* @__PURE__ */ React.createElement(Fab, { ...fab, ref }), placement, open, onOpenChange: onOpenChange && ((o) => onOpenChange(o)), "aria-label": fab.label, className: "srp-fab-menu" }, actions.map(_temp));
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
function _temp(a, i) {
  return /* @__PURE__ */ React.createElement(MenuItem, { key: i, icon: a.icon, disabled: a.disabled, destructive: a.destructive, onSelect: a.onSelect }, a.label);
}
var FabMenu = /* @__PURE__ */ named("FabMenu", FabMenuRender);
export {
  FabMenu
};
//# sourceMappingURL=FabMenu.js.map
