"use client";

// src/components/Fab/Fab.tsx
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { component } from "../../internal/component.js";
var POSITIONS = ["bottom-end", "bottom-start", "top-end", "top-start", "static"];
function useShrinkOnScroll(on) {
  const [shrunk, setShrunk] = React.useState(false);
  React.useEffect(() => {
    if (!on) return;
    let last = window.scrollY;
    const scrolled = () => {
      const y = window.scrollY;
      if (y <= 64) setShrunk(false);
      else if (y > last + 8) setShrunk(true);
      else if (y < last - 8) setShrunk(false);
      else return;
      last = y;
    };
    window.addEventListener("scroll", scrolled, { passive: true });
    return () => window.removeEventListener("scroll", scrolled);
  }, [on]);
  return on && shrunk;
}
var Fab = /* @__PURE__ */ component("Fab", function Fab2(props, ref) {
  const { icon, label, extended, size, placement, className, ...rest } = props;
  const pos = oneOf(POSITIONS, placement, "bottom-end");
  const sm = size === "sm";
  const auto = extended === "auto", shrunk = useShrinkOnScroll(auto);
  const look = {
    variant: "primary",
    size: sm ? "sm" : "md",
    "data-position": pos,
    className: cn("dk-fab", sm && "dk-fab--sm", extended && "dk-fab--extended", auto && "dk-fab--auto", shrunk && "dk-fab--shrunk", pos !== "static" && "dk-fab--" + pos, className)
  };
  const button = extended ? /* @__PURE__ */ React.createElement(ButtonBase, { ...auto ? { "aria-label": label } : null, ...rest, ...look, ref, leftIcon: icon }, auto ? /* @__PURE__ */ React.createElement("span", { className: "dk-fab__label" }, label) : label) : /* @__PURE__ */ React.createElement(ButtonBase, { ...rest, ...look, ref, icon, "aria-label": label });
  const own = rest.title != null || rest["aria-describedby"] != null || rest["aria-labelledby"] != null;
  return own || extended && !auto ? button : /* @__PURE__ */ React.createElement(Tooltip, { content: label, role: "label", disabled: !!rest.disabled || auto && !shrunk }, button);
});
export {
  Fab
};
//# sourceMappingURL=Fab.js.map
