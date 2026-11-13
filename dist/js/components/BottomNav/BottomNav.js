"use client";

// src/components/BottomNav/BottomNav.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { config } from "../../internal/config.js";
import { asIcon } from "../Icon/asIcon.js";
var BottomNav = /* @__PURE__ */ component("BottomNav", function BottomNav2(props, ref) {
  const { className, label, hideFrom = "md", children, ...rest } = props;
  const hide = hideFrom ? `dk-bottom-nav--hide-${hideFrom}` : "dk-bottom-nav--always";
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: cn("dk-bottom-nav__spacer", hide), "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("nav", { ...rest, ref, "aria-label": label, className: cn("dk-bottom-nav", hide, className), "data-component": "bottom-nav" }, /* @__PURE__ */ React.createElement("ul", { className: "dk-bottom-nav__list" }, React.Children.map(children, (c) => c == null || c === false ? null : /* @__PURE__ */ React.createElement("li", { className: "dk-bottom-nav__item" }, c)))));
});
var BottomNavLinkBase = /* @__PURE__ */ component("BottomNavLink", function BottomNavLink(props, ref) {
  const rest = omit(props, { active: 1, as: 1, className: 1, icon: 1, children: 1 });
  return React.createElement(props.as || config.link, Object.assign(rest, {
    ref,
    "aria-current": props.active ? "page" : void 0,
    className: cn("dk-bottom-nav__link", props.active && "dk-bottom-nav__link--active", props.className)
  }), /* @__PURE__ */ React.createElement("span", { className: "dk-bottom-nav__icon", "aria-hidden": "true" }, asIcon(props.icon)), /* @__PURE__ */ React.createElement("span", { className: "dk-bottom-nav__label" }, props.children));
});
var BottomNavLink2 = BottomNavLinkBase;
export {
  BottomNav,
  BottomNavLink2 as BottomNavLink
};
//# sourceMappingURL=BottomNav.js.map
