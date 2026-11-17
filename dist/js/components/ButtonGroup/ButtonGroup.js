"use client";

// src/components/ButtonGroup/ButtonGroup.tsx
import * as React from "react";
import { cn, oneOf, omit, useMergedRef } from "../../internal/cn.js";
import { useRowWrap } from "../../internal/useRowWrap.js";
import { component } from "../../internal/component.js";
import { ControlSize } from "../../internal/controlSize.js";
var ButtonGroup = /* @__PURE__ */ component("ButtonGroup", function ButtonGroup2(props, ref) {
  const rest = omit(props, { attached: 1, orientation: 1, size: 1, className: 1, children: 1 });
  const size = props.size === "sm" || props.size === "md" || props.size === "lg" ? props.size : void 0;
  const vertical = oneOf(["horizontal", "vertical"], props.orientation, "horizontal") === "vertical";
  const attached = props.attached !== false;
  const root = React.useRef(null);
  const wrapped = useRowWrap(root, attached && !vertical, props.children);
  const mergedRef = useMergedRef(ref, (n) => {
    root.current = n;
  });
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      role: "group",
      ...rest,
      ref: mergedRef,
      "data-component": "button-group",
      "data-orientation": vertical ? "vertical" : "horizontal",
      "data-wrapped": wrapped || void 0,
      className: cn("dk-button-group", vertical && "dk-button-group--vertical", attached && !wrapped && "dk-button-group--attached", props.className)
    },
    size ? /* @__PURE__ */ React.createElement(ControlSize.Provider, { value: size }, props.children) : props.children
  );
});
export {
  ButtonGroup
};
//# sourceMappingURL=ButtonGroup.js.map
