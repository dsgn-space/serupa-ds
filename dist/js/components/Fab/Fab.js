// src/components/Fab/Fab.tsx
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { component } from "../../internal/component.js";
import { warnOnce } from "../../internal/warn.js";
var POSITIONS = ["bottom-end", "bottom-start", "top-end", "top-start", "static"];
var Fab = /* @__PURE__ */ component("Fab", function Fab2(props, ref) {
  const { icon, label, extended, size, placement, position, className, ...rest } = props;
  if (process.env.NODE_ENV !== "production" && position != null) warnOnce("fab-position", "Fab: position is deprecated and removed in 15.0.0. Use placement, which does the same.");
  const pos = oneOf(POSITIONS, placement ?? position, "bottom-end");
  const sm = size === "sm";
  const look = {
    variant: "primary",
    size: sm ? "sm" : "md",
    "data-position": pos,
    className: cn("dk-fab", sm && "dk-fab--sm", extended && "dk-fab--extended", pos !== "static" && "dk-fab--" + pos, className)
  };
  return extended ? /* @__PURE__ */ React.createElement(ButtonBase, { ...rest, ...look, ref, leftIcon: icon }, label) : /* @__PURE__ */ React.createElement(ButtonBase, { title: label, ...rest, ...look, ref, icon, "aria-label": label });
});
export {
  Fab
};
//# sourceMappingURL=Fab.js.map
