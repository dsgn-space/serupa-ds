"use client";

// src/components/ToggleGroup/ToggleGroup.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { useRowWrap } from "../../internal/useRowWrap.js";
import { named } from "../../internal/component.js";
import { useControllable } from "../../internal/controllable.js";
function ToggleGroupRender(t0) {
  const $ = _c(9);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    selectionMode: 1,
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    required: 1,
    disabled: 1,
    size: 1,
    variant: 1,
    attached: 1,
    orientation: 1,
    className: 1,
    children: 1
  });
  const vertical = oneOf(["horizontal", "vertical"], props.orientation, "horizontal") === "vertical";
  const single = props.selectionMode !== "multiple";
  const [value, setOwn] = useControllable(props.value, props.defaultValue || [], "ToggleGroup", "value");
  const change = (next) => {
    if (props.value === void 0) {
      setOwn(next);
    }
    if (props.onValueChange) {
      props.onValueChange(next);
    }
  };
  const press = (v, on) => {
    if (single) {
      if (on) {
        change([v]);
      } else {
        if (!props.required) {
          change([]);
        }
      }
      return;
    }
    change(on ? value.concat(v) : value.filter((x) => x !== v));
  };
  const children = React.Children.map(props.children, function(child) {
    if (!React.isValidElement(child) || child.props.value == null) {
      return child;
    }
    const v_0 = String(child.props.value);
    const own = child.props;
    return React.cloneElement(child, {
      pressed: value.indexOf(v_0) >= 0,
      onPressedChange: (on_0) => {
        if (own.onPressedChange) {
          own.onPressedChange(on_0);
        }
        press(v_0, on_0);
      },
      size: own.size ?? props.size,
      variant: own.variant ?? props.variant,
      disabled: own.disabled || props.disabled
    });
  });
  const root = React.useRef(null);
  const wrapped = useRowWrap(root, props.attached !== false && !vertical, props.children);
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
  const t3 = "toggle-group";
  const t4 = vertical ? "vertical" : "horizontal";
  const t5 = single ? "single" : "multiple";
  const t6 = wrapped || void 0;
  const t7 = cn("srp-button-group srp-toggle-group", vertical && "srp-button-group--vertical", props.attached !== false && !wrapped && "srp-button-group--attached", props.className);
  let t8;
  if ($[1] !== children || $[2] !== mergedRef || $[3] !== rest || $[4] !== t4 || $[5] !== t5 || $[6] !== t6 || $[7] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { role: t2, ...rest, ref: mergedRef, "data-component": t3, "data-orientation": t4, "data-type": t5, "data-wrapped": t6, className: t7 }, children);
    $[1] = children;
    $[2] = mergedRef;
    $[3] = rest;
    $[4] = t4;
    $[5] = t5;
    $[6] = t6;
    $[7] = t7;
    $[8] = t8;
  } else {
    t8 = $[8];
  }
  return t8;
}
var ToggleGroup = /* @__PURE__ */ named("ToggleGroup", ToggleGroupRender);
export {
  ToggleGroup
};
//# sourceMappingURL=ToggleGroup.js.map
