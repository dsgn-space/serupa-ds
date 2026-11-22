"use client";

// src/components/ButtonGroup/ButtonGroup.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { useRowWrap } from "../../internal/useRowWrap.js";
import { named } from "../../internal/component.js";
import { ControlSize } from "../../internal/controlSize.js";
function ButtonGroupRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    attached: 1,
    orientation: 1,
    size: 1,
    className: 1,
    children: 1
  });
  const size = props.size === "sm" || props.size === "md" || props.size === "lg" ? props.size : void 0;
  const vertical = oneOf(["horizontal", "vertical"], props.orientation, "horizontal") === "vertical";
  const attached = props.attached !== false;
  const root = React.useRef(null);
  const wrapped = useRowWrap(root, attached && !vertical, props.children);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n) => {
      root.current = n;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const mergedRef = useMergedRef(ref, t1);
  const t2 = "group";
  const t3 = "button-group";
  const t4 = vertical ? "vertical" : "horizontal";
  const t5 = wrapped || void 0;
  const t6 = cn("srp-button-group", vertical && "srp-button-group--vertical", attached && !wrapped && "srp-button-group--attached", props.className);
  let t7;
  if ($[1] !== props.children || $[2] !== size) {
    t7 = size ? /* @__PURE__ */ React.createElement(ControlSize.Provider, { value: size }, props.children) : props.children;
    $[1] = props.children;
    $[2] = size;
    $[3] = t7;
  } else {
    t7 = $[3];
  }
  let t8;
  if ($[4] !== mergedRef || $[5] !== rest || $[6] !== t4 || $[7] !== t5 || $[8] !== t6 || $[9] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { role: t2, ...rest, ref: mergedRef, "data-component": t3, "data-orientation": t4, "data-wrapped": t5, className: t6 }, t7);
    $[4] = mergedRef;
    $[5] = rest;
    $[6] = t4;
    $[7] = t5;
    $[8] = t6;
    $[9] = t7;
    $[10] = t8;
  } else {
    t8 = $[10];
  }
  return t8;
}
var ButtonGroup = /* @__PURE__ */ named("ButtonGroup", ButtonGroupRender);
export {
  ButtonGroup
};
//# sourceMappingURL=ButtonGroup.js.map
