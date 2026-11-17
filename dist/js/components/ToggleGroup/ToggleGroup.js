"use client";

// src/components/ToggleGroup/ToggleGroup.tsx
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { useRowWrap } from "../../internal/useRowWrap.js";
import { component } from "../../internal/component.js";
import { useControllable } from "../../internal/controllable.js";
var ToggleGroup = /* @__PURE__ */ component("ToggleGroup", function ToggleGroup2(props, ref) {
  const rest = omit(props, { type: 1, value: 1, defaultValue: 1, onValueChange: 1, required: 1, disabled: 1, size: 1, variant: 1, attached: 1, orientation: 1, className: 1, children: 1 });
  const vertical = oneOf(["horizontal", "vertical"], props.orientation, "horizontal") === "vertical";
  const single = props.type !== "multiple";
  const [value, setOwn] = useControllable(props.value, props.defaultValue || [], "ToggleGroup", "value");
  const change = (next) => {
    if (props.value === void 0) setOwn(next);
    if (props.onValueChange) props.onValueChange(next);
  };
  const press = (v, on) => {
    if (single) {
      if (on) change([v]);
      else if (!props.required) change([]);
      return;
    }
    change(on ? value.concat(v) : value.filter((x) => x !== v));
  };
  const children = React.Children.map(props.children, function(child) {
    if (!React.isValidElement(child) || child.props.value == null) return child;
    const v = String(child.props.value), own = child.props;
    return React.cloneElement(child, {
      pressed: value.indexOf(v) >= 0,
      onPressedChange: (on) => {
        if (own.onPressedChange) own.onPressedChange(on);
        press(v, on);
      },
      size: own.size ?? props.size,
      variant: own.variant ?? props.variant,
      disabled: own.disabled || props.disabled
    });
  });
  const root = React.useRef(null);
  const wrapped = useRowWrap(root, props.attached !== false && !vertical, props.children);
  const mergedRef = useMergedRef(ref, (n) => {
    root.current = n;
  });
  return (
    // ButtonGroup's markup and classes, so it looks and lays out the same.
    /* @__PURE__ */ React.createElement(
      "div",
      {
        role: "group",
        ...rest,
        ref: mergedRef,
        "data-component": "toggle-group",
        "data-orientation": vertical ? "vertical" : "horizontal",
        "data-type": single ? "single" : "multiple",
        "data-wrapped": wrapped || void 0,
        className: cn("dk-button-group dk-toggle-group", vertical && "dk-button-group--vertical", props.attached !== false && !wrapped && "dk-button-group--attached", props.className)
      },
      children
    )
  );
});
export {
  ToggleGroup
};
//# sourceMappingURL=ToggleGroup.js.map
