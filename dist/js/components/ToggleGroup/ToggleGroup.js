"use client";

// src/components/ToggleGroup/ToggleGroup.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup.js";
import { useControllable } from "../../internal/controllable.js";
function ToggleGroupRender(t0) {
  const $ = _c(11);
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
  const T0 = ButtonGroup;
  const t1 = single ? "single" : "multiple";
  let t2;
  if ($[0] !== t1) {
    t2 = {
      "data-component": "toggle-group",
      "data-type": t1
    };
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = vertical ? "vertical" : "horizontal";
  const t4 = props.attached;
  const t5 = cn("srp-toggle-group", props.className);
  let t6;
  if ($[2] !== T0 || $[3] !== children || $[4] !== props || $[5] !== ref || $[6] !== rest || $[7] !== t2 || $[8] !== t3 || $[9] !== t5) {
    t6 = /* @__PURE__ */ React.createElement(T0, { ...rest, ref, ...t2, orientation: t3, attached: t4, className: t5 }, children);
    $[2] = T0;
    $[3] = children;
    $[4] = props;
    $[5] = ref;
    $[6] = rest;
    $[7] = t2;
    $[8] = t3;
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
var ToggleGroup = /* @__PURE__ */ named("ToggleGroup", ToggleGroupRender);
export {
  ToggleGroup
};
//# sourceMappingURL=ToggleGroup.js.map
