"use client";

// src/components/DescriptionList/DescriptionList.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
function DescriptionListRender(t0) {
  const $ = _c(10);
  let t1;
  let t2;
  let t3;
  let t4;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      className,
      layout: layoutProp,
      dividers,
      ...rest
    } = props;
    const layout = layoutProp === void 0 ? "inline" : layoutProp;
    t1 = rest;
    t2 = ref;
    t3 = "description-list";
    t4 = cn("srp-description-list", `srp-description-list--${layout}`, dividers && "srp-description-list--dividers", className);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
    t4 = $[4];
  }
  let t5;
  if ($[5] !== t1 || $[6] !== t2 || $[7] !== t3 || $[8] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("dl", { ...t1, ref: t2, "data-component": t3, className: t4 });
    $[5] = t1;
    $[6] = t2;
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  return t5;
}
var DescriptionList = /* @__PURE__ */ named("DescriptionList", DescriptionListRender);
function DescriptionItemRender(t0) {
  const $ = _c(16);
  let children;
  let t1;
  let t2;
  let t3;
  let term;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      className,
      term: t42,
      children: t52,
      emphasis,
      ...rest
    } = props;
    term = t42;
    children = t52;
    t1 = rest;
    t2 = ref;
    t3 = cn("srp-description-list__item", emphasis && "srp-description-list__item--emphasis", className);
    $[0] = t0;
    $[1] = children;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
    $[5] = term;
  } else {
    children = $[1];
    t1 = $[2];
    t2 = $[3];
    t3 = $[4];
    term = $[5];
  }
  let t4;
  if ($[6] !== term) {
    t4 = /* @__PURE__ */ React.createElement("dt", { className: "srp-description-list__term" }, term);
    $[6] = term;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] !== children) {
    t5 = /* @__PURE__ */ React.createElement("dd", { className: "srp-description-list__details" }, children);
    $[8] = children;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  let t6;
  if ($[10] !== t1 || $[11] !== t2 || $[12] !== t3 || $[13] !== t4 || $[14] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("div", { ...t1, ref: t2, className: t3 }, t4, t5);
    $[10] = t1;
    $[11] = t2;
    $[12] = t3;
    $[13] = t4;
    $[14] = t5;
    $[15] = t6;
  } else {
    t6 = $[15];
  }
  return t6;
}
var DescriptionItem = /* @__PURE__ */ named("DescriptionItem", DescriptionItemRender);
export {
  DescriptionItem,
  DescriptionList
};
//# sourceMappingURL=DescriptionList.js.map
