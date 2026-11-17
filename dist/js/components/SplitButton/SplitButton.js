"use client";

// src/components/SplitButton/SplitButton.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import * as icons from "../../material/builtin.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Menu } from "../Menu/Menu.js";
var OWN = { children: 1, onClick: 1, menu: 1, menuLabel: 1, variant: 1, size: 1, destructive: 1, leftIcon: 1, disabled: 1, loading: 1, placement: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1 };
var SplitButton = /* @__PURE__ */ component("SplitButton", function SplitButton2(props, ref) {
  const rest = omit(props, OWN);
  const variant = props.variant === "secondary" || props.variant === "outline" ? props.variant : "primary";
  const size = props.size === "sm" || props.size === "lg" ? props.size : "md";
  const label = rest["aria-label"], labelledBy = rest["aria-labelledby"];
  delete rest["aria-label"];
  delete rest["aria-labelledby"];
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-split-button", props.className), "data-component": "split-button" }, /* @__PURE__ */ React.createElement("div", { role: "group", "aria-label": label, "aria-labelledby": labelledBy, "data-component": "button-group", "data-orientation": "horizontal", className: "dk-button-group dk-button-group--attached" }, /* @__PURE__ */ React.createElement(Button, { size, variant, destructive: props.destructive, leftIcon: props.leftIcon, disabled: props.disabled, loading: props.loading, onClick: props.onClick }, props.children), /* @__PURE__ */ React.createElement(
    Menu,
    {
      placement: props.placement ?? "bottom-end",
      open: props.open,
      defaultOpen: props.defaultOpen,
      onOpenChange: props.onOpenChange,
      trigger: /* @__PURE__ */ React.createElement(IconButton, { className: "dk-split-button__menu", size, variant, destructive: props.destructive, disabled: props.disabled, icon: icons.ExpandMore, label: props.menuLabel })
    },
    props.menu
  )));
});
export {
  SplitButton
};
//# sourceMappingURL=SplitButton.js.map
