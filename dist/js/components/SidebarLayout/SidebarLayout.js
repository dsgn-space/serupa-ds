// src/components/SidebarLayout/SidebarLayout.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { space } from "../../internal/space.js";
import { named } from "../../internal/component.js";
var TAGS = ["div", "section", "main", "article"];
function SidebarLayoutRender({ ref, ...props }) {
  const rest = omit(props, { sidebar: 1, children: 1, sidebarPlacement: 1, sidebarWidth: 1, contentMin: 1, gap: 1, align: 1, as: 1, className: 1, style: 1 });
  const vars = {};
  const w = props.sidebarWidth;
  if (w) vars["--srp-sidebar-layout-side"] = /^[a-z][a-z0-9-]*$/.test(w) ? "var(--" + w + ")" : w;
  const min = typeof props.contentMin === "number" && props.contentMin >= 1 && props.contentMin <= 99 ? props.contentMin : 0;
  if (min) vars["--srp-sidebar-layout-min"] = min + "%";
  const gap = space(props.gap);
  if (gap) vars["--srp-sidebar-layout-gap"] = gap;
  const end = props.sidebarPlacement === "end";
  const side = /* @__PURE__ */ React.createElement("div", { className: "srp-sidebar-layout__side" }, props.sidebar);
  const Tag = oneOf(TAGS, props.as, "div");
  return /* @__PURE__ */ React.createElement(
    Tag,
    {
      ...rest,
      ref,
      "data-component": "sidebar-layout",
      className: cn("srp-sidebar-layout", end && "srp-sidebar-layout--end", props.align === "start" && "srp-sidebar-layout--align-start", props.className),
      style: Object.keys(vars).length ? Object.assign(vars, props.style) : props.style
    },
    end ? null : side,
    /* @__PURE__ */ React.createElement("div", { className: "srp-sidebar-layout__content" }, props.children),
    end ? side : null
  );
}
var SidebarLayout = /* @__PURE__ */ named("SidebarLayout", SidebarLayoutRender);
export {
  SidebarLayout
};
//# sourceMappingURL=SidebarLayout.js.map
