"use client";

// src/components/Fab/Fab.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { named } from "../../internal/component.js";
var POSITIONS = ["bottom-end", "bottom-start", "top-end", "top-start", "static"];
function useShrinkOnScroll(on) {
  const $ = _c(3);
  const [shrunk, setShrunk] = React.useState(false);
  let t0;
  let t1;
  if ($[0] !== on) {
    t0 = () => {
      if (!on) {
        return;
      }
      let last = window.scrollY;
      const scrolled = () => {
        const y = window.scrollY;
        if (y <= 64) {
          setShrunk(false);
        } else {
          if (y > last + 8) {
            setShrunk(true);
          } else {
            if (y < last - 8) {
              setShrunk(false);
            } else {
              return;
            }
          }
        }
        last = y;
      };
      window.addEventListener("scroll", scrolled, {
        passive: true
      });
      return () => window.removeEventListener("scroll", scrolled);
    };
    t1 = [on];
    $[0] = on;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  React.useEffect(t0, t1);
  return on && shrunk;
}
function FabRender(t0) {
  const $ = _c(20);
  const {
    ref,
    ...props
  } = t0;
  const {
    icon,
    label,
    extended,
    size,
    placement,
    className,
    ...rest
  } = props;
  const pos = oneOf(POSITIONS, placement, "bottom-end");
  const sm = size === "sm";
  const auto = extended === "auto";
  const shrunk = useShrinkOnScroll(auto);
  const t1 = "primary";
  const t2 = sm ? "sm" : "md";
  const t3 = cn("srp-fab", sm && "srp-fab--sm", extended && "srp-fab--extended", auto && "srp-fab--auto", shrunk && "srp-fab--shrunk", pos !== "static" && "srp-fab--" + pos, className);
  let t4;
  if ($[0] !== pos || $[1] !== t2 || $[2] !== t3) {
    t4 = {
      variant: t1,
      size: t2,
      "data-position": pos,
      className: t3
    };
    $[0] = pos;
    $[1] = t2;
    $[2] = t3;
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const look = t4;
  let t5;
  if ($[4] !== auto || $[5] !== extended || $[6] !== icon || $[7] !== label || $[8] !== look || $[9] !== ref || $[10] !== rest) {
    t5 = extended ? /* @__PURE__ */ React.createElement(ButtonBase, { ...auto ? {
      "aria-label": label
    } : null, ...rest, ...look, ref, startIcon: icon }, auto ? /* @__PURE__ */ React.createElement("span", { className: "srp-fab__label" }, label) : label) : /* @__PURE__ */ React.createElement(ButtonBase, { ...rest, ...look, ref, icon, "aria-label": label });
    $[4] = auto;
    $[5] = extended;
    $[6] = icon;
    $[7] = label;
    $[8] = look;
    $[9] = ref;
    $[10] = rest;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  const button = t5;
  const own = rest.title != null || rest["aria-describedby"] != null || rest["aria-labelledby"] != null;
  let t6;
  if ($[12] !== auto || $[13] !== button || $[14] !== extended || $[15] !== label || $[16] !== own || $[17] !== rest.disabled || $[18] !== shrunk) {
    t6 = own || extended && !auto ? button : /* @__PURE__ */ React.createElement(Tooltip, { content: label, role: "label", disabled: !!rest.disabled || auto && !shrunk }, button);
    $[12] = auto;
    $[13] = button;
    $[14] = extended;
    $[15] = label;
    $[16] = own;
    $[17] = rest.disabled;
    $[18] = shrunk;
    $[19] = t6;
  } else {
    t6 = $[19];
  }
  return t6;
}
var Fab = /* @__PURE__ */ named("Fab", FabRender);
export {
  Fab
};
//# sourceMappingURL=Fab.js.map
