"use client";

// src/components/ToggleButton/ToggleButton.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { named } from "../../internal/component.js";
function ToggleButtonRender(t0) {
  const $ = _c(14);
  const {
    ref,
    ...props
  } = t0;
  const {
    pressed,
    defaultPressed,
    onPressedChange,
    variant,
    className,
    onClick,
    ...rest
  } = props;
  const [own, setOwn] = React.useState(!!defaultPressed);
  const controlled = pressed !== void 0;
  const on = controlled ? !!pressed : own;
  const v = oneOf(["outline", "ghost"], variant, "outline");
  const T0 = ButtonBase;
  const t1 = cn("srp-toggle-button", on && "srp-toggle-button--pressed", className);
  let t2;
  if ($[0] !== controlled || $[1] !== on || $[2] !== onClick || $[3] !== onPressedChange || $[4] !== setOwn) {
    t2 = (e) => {
      if (onClick) {
        onClick(e);
      }
      if (e.defaultPrevented) {
        return;
      }
      if (!controlled) {
        setOwn(!on);
      }
      if (onPressedChange) {
        onPressedChange(!on);
      }
    };
    $[0] = controlled;
    $[1] = on;
    $[2] = onClick;
    $[3] = onPressedChange;
    $[4] = setOwn;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== T0 || $[7] !== on || $[8] !== ref || $[9] !== rest || $[10] !== t1 || $[11] !== t2 || $[12] !== v) {
    t3 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, variant: v, "aria-pressed": on, className: t1, onClick: t2 });
    $[6] = T0;
    $[7] = on;
    $[8] = ref;
    $[9] = rest;
    $[10] = t1;
    $[11] = t2;
    $[12] = v;
    $[13] = t3;
  } else {
    t3 = $[13];
  }
  return t3;
}
var ToggleButton = /* @__PURE__ */ named("ToggleButton", ToggleButtonRender);
export {
  ToggleButton
};
//# sourceMappingURL=ToggleButton.js.map
