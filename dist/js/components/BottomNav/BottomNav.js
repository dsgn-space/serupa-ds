"use client";

// src/components/BottomNav/BottomNav.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { config } from "../../internal/config.js";
import { asIcon } from "../Icon/asIcon.js";
import { TruncatedText } from "../TruncatedText/TruncatedText.js";
function BottomNavRender(t0) {
  const $ = _c(24);
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let t7;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      className,
      hideFrom: _hideFrom,
      children,
      ...rest
    } = props;
    const hideFrom = props.hideFrom ?? "md";
    const hide = hideFrom ? `srp-bottom-nav--hide-${hideFrom}` : "srp-bottom-nav--always";
    let t82;
    if ($[8] !== hide) {
      t82 = cn("srp-bottom-nav__spacer", hide);
      $[8] = hide;
      $[9] = t82;
    } else {
      t82 = $[9];
    }
    if ($[10] !== t82) {
      t7 = /* @__PURE__ */ React.createElement("div", { className: t82, "aria-hidden": "true" });
      $[10] = t82;
      $[11] = t7;
    } else {
      t7 = $[11];
    }
    t3 = rest;
    t4 = ref;
    t5 = cn("srp-bottom-nav", hide, className);
    t6 = "bottom-nav";
    t1 = "srp-bottom-nav__list";
    t2 = React.Children.map(children, _temp);
    $[0] = t0;
    $[1] = t1;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
    $[5] = t5;
    $[6] = t6;
    $[7] = t7;
  } else {
    t1 = $[1];
    t2 = $[2];
    t3 = $[3];
    t4 = $[4];
    t5 = $[5];
    t6 = $[6];
    t7 = $[7];
  }
  let t8;
  if ($[12] !== t1 || $[13] !== t2) {
    t8 = /* @__PURE__ */ React.createElement("ul", { className: t1 }, t2);
    $[12] = t1;
    $[13] = t2;
    $[14] = t8;
  } else {
    t8 = $[14];
  }
  let t9;
  if ($[15] !== t3 || $[16] !== t4 || $[17] !== t5 || $[18] !== t6 || $[19] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("nav", { ...t3, ref: t4, className: t5, "data-component": t6 }, t8);
    $[15] = t3;
    $[16] = t4;
    $[17] = t5;
    $[18] = t6;
    $[19] = t8;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] !== t7 || $[22] !== t9) {
    t10 = /* @__PURE__ */ React.createElement(React.Fragment, null, t7, t9);
    $[21] = t7;
    $[22] = t9;
    $[23] = t10;
  } else {
    t10 = $[23];
  }
  return t10;
}
function _temp(c) {
  return c == null || c === false ? null : /* @__PURE__ */ React.createElement("li", { className: "srp-bottom-nav__item" }, c);
}
var BottomNav = /* @__PURE__ */ named("BottomNav", BottomNavRender);
function BottomNavLinkBaseRender(t0) {
  const $ = _c(18);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    current: 1,
    as: 1,
    className: 1,
    icon: 1,
    children: 1,
    badge: 1
  });
  const badgeId = React.useId();
  const badge = props.badge != null && props.badge !== false;
  if (badge) {
    rest["aria-describedby"] = cn(rest["aria-describedby"], badgeId);
  }
  const Tag = props.as || config.link;
  const t1 = props.current ? "page" : void 0;
  const t2 = cn("srp-bottom-nav__link", props.current && "srp-bottom-nav__link--active", props.className);
  const t3 = props.current ? "" : void 0;
  const t4 = "srp-bottom-nav__icon";
  const t5 = "true";
  const t6 = asIcon(props.icon);
  let t7;
  if ($[0] !== badge || $[1] !== badgeId || $[2] !== props.badge) {
    t7 = badge ? /* @__PURE__ */ React.createElement("span", { className: "srp-bottom-nav__badge", id: badgeId }, props.badge) : null;
    $[0] = badge;
    $[1] = badgeId;
    $[2] = props.badge;
    $[3] = t7;
  } else {
    t7 = $[3];
  }
  let t8;
  if ($[4] !== t6 || $[5] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: t4, "aria-hidden": t5 }, t6, t7);
    $[4] = t6;
    $[5] = t7;
    $[6] = t8;
  } else {
    t8 = $[6];
  }
  let t9;
  if ($[7] !== props.children) {
    t9 = typeof props.children === "string" ? /* @__PURE__ */ React.createElement(TruncatedText, { className: "srp-bottom-nav__label" }, props.children) : /* @__PURE__ */ React.createElement("span", { className: "srp-bottom-nav__label" }, props.children);
    $[7] = props.children;
    $[8] = t9;
  } else {
    t9 = $[8];
  }
  let t10;
  if ($[9] !== Tag || $[10] !== ref || $[11] !== rest || $[12] !== t1 || $[13] !== t2 || $[14] !== t3 || $[15] !== t8 || $[16] !== t9) {
    t10 = /* @__PURE__ */ React.createElement(Tag, { ...rest, ref, "aria-current": t1, className: t2, "data-current": t3 }, t8, t9);
    $[9] = Tag;
    $[10] = ref;
    $[11] = rest;
    $[12] = t1;
    $[13] = t2;
    $[14] = t3;
    $[15] = t8;
    $[16] = t9;
    $[17] = t10;
  } else {
    t10 = $[17];
  }
  return t10;
}
var BottomNavLinkBase = /* @__PURE__ */ named("BottomNavLink", BottomNavLinkBaseRender);
var BottomNavLink = BottomNavLinkBase;
export {
  BottomNav,
  BottomNavLink
};
//# sourceMappingURL=BottomNav.js.map
