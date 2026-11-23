"use client";

// src/components/IconTile/IconTile.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
var TONES = ["neutral", "primary", "success", "warning", "danger", "info"];
var SIZES = ["sm", "md", "lg", "xl"];
function IconTileRender(t0) {
  const $ = _c(18);
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let t7;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const rest = omit(props, {
      icon: 1,
      tone: 1,
      size: 1,
      shape: 1,
      label: 1,
      className: 1,
      children: 1
    });
    const tone = oneOf(TONES, props.tone, "neutral");
    const size = oneOf(SIZES, props.size, "md");
    const named2 = props.label ? {
      role: "img",
      "aria-label": props.label
    } : {
      "aria-hidden": true
    };
    t3 = named2;
    t4 = rest;
    t5 = ref;
    t6 = "icon-tile";
    t7 = cn("srp-icon-tile", "srp-icon-tile--" + tone, "srp-icon-tile--" + size, props.shape === "circle" && "srp-icon-tile--circle", props.className);
    t1 = "srp-icon-tile__icon";
    t2 = asIcon(props.icon);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
    $[6] = t6;
    $[7] = t7;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
    t4 = $[4];
    t5 = $[5];
    t6 = $[6];
    t7 = $[7];
  }
  let t8;
  if ($[8] !== t1 || $[9] !== t2) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: t1 }, t2);
    $[8] = t1;
    $[9] = t2;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  let t9;
  if ($[11] !== t3 || $[12] !== t4 || $[13] !== t5 || $[14] !== t6 || $[15] !== t7 || $[16] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("span", { ...t3, ...t4, ref: t5, "data-component": t6, className: t7 }, t8);
    $[11] = t3;
    $[12] = t4;
    $[13] = t5;
    $[14] = t6;
    $[15] = t7;
    $[16] = t8;
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  return t9;
}
var IconTile = /* @__PURE__ */ named("IconTile", IconTileRender);
export {
  IconTile
};
//# sourceMappingURL=IconTile.js.map
