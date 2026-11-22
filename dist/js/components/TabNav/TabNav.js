"use client";

// src/components/TabNav/TabNav.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { config } from "../../internal/config.js";
import { named } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
import { useTabRow } from "../Tabs/tabRow.js";
function currentHref(children) {
  let found = null;
  React.Children.forEach(children, (c) => {
    if (found != null || !React.isValidElement(c)) return;
    const p = c.props;
    if (c.type === TabNavLink) {
      if (p.current) found = String(p.href);
      return;
    }
    found = currentHref(p.children);
  });
  return found;
}
function TabNavRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    variant: 1,
    size: 1,
    className: 1,
    children: 1
  });
  const variant = oneOf(["line", "pill"], props.variant, "line");
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const [list, fade] = useTabRow(".srp-tabs__tab", '.srp-tabs__tab[aria-current="page"]', false, currentHref(props.children));
  const t1 = cn("srp-tabs", "srp-tabs--" + variant, size !== "md" && "srp-tabs--" + size, "srp-tab-nav", props.className);
  const t2 = fade.before ? "" : void 0;
  const t3 = fade.after ? "" : void 0;
  let t4;
  if ($[0] !== list || $[1] !== props.children || $[2] !== t2 || $[3] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("ul", { ref: list, className: "srp-tabs__list srp-tab-nav__list", "data-fade-before": t2, "data-fade-after": t3 }, props.children);
    $[0] = list;
    $[1] = props.children;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== ref || $[6] !== rest || $[7] !== t1 || $[8] !== t4 || $[9] !== variant) {
    t5 = /* @__PURE__ */ React.createElement("nav", { ...rest, ref, className: t1, "data-component": "tab-nav", "data-variant": variant }, t4);
    $[5] = ref;
    $[6] = rest;
    $[7] = t1;
    $[8] = t4;
    $[9] = variant;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}
var TabNav = /* @__PURE__ */ named("TabNav", TabNavRender);
function TabNavLinkBaseRender(t0) {
  const $ = _c(8);
  let t1;
  let t2;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const rest = omit(props, {
      current: 1,
      icon: 1,
      as: 1,
      className: 1,
      children: 1
    });
    const attrs = {
      ...rest,
      ref,
      "aria-current": props.current ? "page" : void 0,
      "data-state": props.current ? "active" : "inactive",
      className: cn("srp-tabs__tab", props.className)
    };
    t1 = "srp-tab-nav__item";
    let t32;
    if ($[3] !== props) {
      t32 = /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__label" }, props.children);
      $[3] = props;
      $[4] = t32;
    } else {
      t32 = $[4];
    }
    t2 = React.createElement(props.as || config.link, attrs, props.icon != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-tabs__icon", "aria-hidden": "true" }, asIcon(props.icon)) : null, t32);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  let t3;
  if ($[5] !== t1 || $[6] !== t2) {
    t3 = /* @__PURE__ */ React.createElement("li", { className: t1 }, t2);
    $[5] = t1;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  return t3;
}
var TabNavLinkBase = /* @__PURE__ */ named("TabNavLink", TabNavLinkBaseRender);
var TabNavLink = TabNavLinkBase;
export {
  TabNav,
  TabNavLink
};
//# sourceMappingURL=TabNav.js.map
