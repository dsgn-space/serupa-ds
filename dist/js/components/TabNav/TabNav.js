"use client";

// src/components/TabNav/TabNav.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { component } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
import { useTabRow } from "../Tabs/tabRow.js";
function currentHref(children) {
  let found = null;
  React.Children.forEach(children, (c) => {
    if (found != null || !React.isValidElement(c)) return;
    const p = c.props;
    if (c.type === TabNavLink2) {
      if (p.current) found = String(p.href);
      return;
    }
    found = currentHref(p.children);
  });
  return found;
}
var TabNav = /* @__PURE__ */ component("TabNav", function TabNav2(props, ref) {
  const rest = omit(props, { variant: 1, size: 1, className: 1, children: 1 });
  const variant = oneOf(["line", "pill"], props.variant, "line");
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const [list, fade] = useTabRow(".dk-tabs__tab", '.dk-tabs__tab[aria-current="page"]', false, currentHref(props.children));
  return /* @__PURE__ */ React.createElement("nav", { ...rest, ref, className: cn("dk-tabs", "dk-tabs--" + variant, size !== "md" && "dk-tabs--" + size, "dk-tab-nav", props.className), "data-component": "tab-nav", "data-variant": variant }, /* @__PURE__ */ React.createElement("ul", { ref: list, className: "dk-tabs__list dk-tab-nav__list", "data-fade-before": fade.before ? "" : void 0, "data-fade-after": fade.after ? "" : void 0 }, props.children));
});
var TabNavLinkBase = /* @__PURE__ */ component("TabNavLink", function TabNavLink(props, ref) {
  const rest = omit(props, { current: 1, icon: 1, as: 1, className: 1, children: 1 });
  const attrs = Object.assign(rest, {
    ref,
    "aria-current": props.current ? "page" : void 0,
    "data-state": props.current ? "active" : "inactive",
    className: cn("dk-tabs__tab", props.className)
  });
  return /* @__PURE__ */ React.createElement("li", { className: "dk-tab-nav__item" }, React.createElement(
    props.as || config.link,
    attrs,
    props.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-tabs__icon", "aria-hidden": "true" }, asIcon(props.icon)) : null,
    /* @__PURE__ */ React.createElement("span", { className: "dk-tabs__label" }, props.children)
  ));
});
var TabNavLink2 = TabNavLinkBase;
export {
  TabNav,
  TabNavLink2 as TabNavLink
};
//# sourceMappingURL=TabNav.js.map
