"use client";

// src/components/SplitButton/SplitButton.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu } from "../Menu/Menu.js";
var OWN = {
  children: 1,
  onClick: 1,
  menu: 1,
  menuLabel: 1,
  variant: 1,
  size: 1,
  destructive: 1,
  startIcon: 1,
  disabled: 1,
  loading: 1,
  placement: 1,
  open: 1,
  defaultOpen: 1,
  onOpenChange: 1,
  className: 1
};
function SplitButtonRender(t0) {
  const $ = _c(41);
  let label;
  let labelledBy;
  let props;
  let size;
  let t1;
  let t2;
  let t3;
  let variant;
  if ($[0] !== t0) {
    const {
      ref,
      ...t42
    } = t0;
    props = t42;
    const rest = omit(props, OWN);
    variant = props.variant === "secondary" || props.variant === "outline" ? props.variant : "primary";
    size = props.size === "sm" || props.size === "lg" ? props.size : "md";
    label = rest["aria-label"];
    labelledBy = rest["aria-labelledby"];
    delete rest["aria-label"];
    delete rest["aria-labelledby"];
    t1 = rest;
    t2 = ref;
    t3 = cn("srp-split-button", props.className);
    $[0] = t0;
    $[1] = label;
    $[2] = labelledBy;
    $[3] = props;
    $[4] = size;
    $[5] = t1;
    $[6] = t2;
    $[7] = t3;
    $[8] = variant;
  } else {
    label = $[1];
    labelledBy = $[2];
    props = $[3];
    size = $[4];
    t1 = $[5];
    t2 = $[6];
    t3 = $[7];
    variant = $[8];
  }
  let t4;
  if ($[9] !== props.children || $[10] !== props.destructive || $[11] !== props.disabled || $[12] !== props.loading || $[13] !== props.onClick || $[14] !== props.startIcon || $[15] !== size || $[16] !== variant) {
    t4 = /* @__PURE__ */ React.createElement(Button, { size, variant, destructive: props.destructive, startIcon: props.startIcon, disabled: props.disabled, loading: props.loading, onClick: props.onClick }, props.children);
    $[9] = props.children;
    $[10] = props.destructive;
    $[11] = props.disabled;
    $[12] = props.loading;
    $[13] = props.onClick;
    $[14] = props.startIcon;
    $[15] = size;
    $[16] = variant;
    $[17] = t4;
  } else {
    t4 = $[17];
  }
  const t5 = props.placement ?? "bottom-end";
  let t6;
  if ($[18] !== props.destructive || $[19] !== props.disabled || $[20] !== props.menuLabel || $[21] !== size || $[22] !== variant) {
    t6 = /* @__PURE__ */ React.createElement(IconButton, { className: "srp-split-button__menu", size, variant, destructive: props.destructive, disabled: props.disabled, icon: icons.ExpandMore, label: props.menuLabel });
    $[18] = props.destructive;
    $[19] = props.disabled;
    $[20] = props.menuLabel;
    $[21] = size;
    $[22] = variant;
    $[23] = t6;
  } else {
    t6 = $[23];
  }
  let t7;
  if ($[24] !== props.defaultOpen || $[25] !== props.menu || $[26] !== props.onOpenChange || $[27] !== props.open || $[28] !== t5 || $[29] !== t6) {
    t7 = /* @__PURE__ */ React.createElement(Menu, { placement: t5, open: props.open, defaultOpen: props.defaultOpen, onOpenChange: props.onOpenChange, trigger: t6 }, props.menu);
    $[24] = props.defaultOpen;
    $[25] = props.menu;
    $[26] = props.onOpenChange;
    $[27] = props.open;
    $[28] = t5;
    $[29] = t6;
    $[30] = t7;
  } else {
    t7 = $[30];
  }
  let t8;
  if ($[31] !== label || $[32] !== labelledBy || $[33] !== t4 || $[34] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": label, "aria-labelledby": labelledBy, "data-component": "button-group", "data-orientation": "horizontal", className: "srp-button-group srp-button-group--attached" }, t4, t7);
    $[31] = label;
    $[32] = labelledBy;
    $[33] = t4;
    $[34] = t7;
    $[35] = t8;
  } else {
    t8 = $[35];
  }
  let t9;
  if ($[36] !== t1 || $[37] !== t2 || $[38] !== t3 || $[39] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("div", { ...t1, ref: t2, className: t3, "data-component": "split-button" }, t8);
    $[36] = t1;
    $[37] = t2;
    $[38] = t3;
    $[39] = t8;
    $[40] = t9;
  } else {
    t9 = $[40];
  }
  return t9;
}
var SplitButton = /* @__PURE__ */ named("SplitButton", SplitButtonRender);
export {
  SplitButton
};
//# sourceMappingURL=SplitButton.js.map
