"use client";

// src/components/IconTile/IconTile.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
var TONES = ["neutral", "primary", "success", "warning", "danger", "info"];
var SIZES = ["sm", "md", "lg", "xl"];
var IconTile = /* @__PURE__ */ component("IconTile", function IconTile2(props, ref) {
  const rest = omit(props, { icon: 1, tone: 1, size: 1, shape: 1, label: 1, className: 1, children: 1 });
  const tone = oneOf(TONES, props.tone, "neutral");
  const size = oneOf(SIZES, props.size, "md");
  const named = props.label ? { role: "img", "aria-label": props.label } : { "aria-hidden": true };
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      ...named,
      ...rest,
      ref,
      "data-component": "icon-tile",
      className: cn("dk-icon-tile", "dk-icon-tile--" + tone, "dk-icon-tile--" + size, props.shape === "circle" && "dk-icon-tile--circle", props.className)
    },
    /* @__PURE__ */ React.createElement("span", { className: "dk-icon-tile__icon" }, asIcon(props.icon))
  );
});
export {
  IconTile
};
//# sourceMappingURL=IconTile.js.map
