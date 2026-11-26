"use client";

// src/components/AvatarGroup/AvatarGroup.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { AVATAR_SIZES, AvatarGroupSize } from "../Avatar/Avatar.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { flattenChildren } from "../../internal/children.js";
import { Popover } from "../Popover/Popover.js";
import { en as words } from "./labels.js";
var PLAIN = {
  useGrouping: false
};
var OWN = {
  children: 1,
  max: 1,
  total: 1,
  size: 1,
  moreLabel: 1,
  showMore: 1,
  onMore: 1,
  className: 1
};
function AvatarGroupRender(t0) {
  const $ = _c(6);
  const {
    ref,
    ...props
  } = t0;
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const size = oneOf(AVATAR_SIZES, props.size, "md");
  const all = flattenChildren(props.children).filter(React.isValidElement);
  const max = props.max != null && props.max >= 0 ? Math.floor(props.max) : Infinity;
  const total = Math.max(all.length, props.total != null && props.total > 0 ? Math.floor(props.total) : 0);
  const shown = all.slice(0, max);
  const sds = useSettings(words);
  const locale = useLocale();
  const more = total - shown.length;
  const count = shown.length + (more > 0 ? 1 : 0);
  const cap = size === "xs" ? 9 : 99;
  let t1;
  if ($[0] !== locale) {
    t1 = (n) => displayNumber(n, locale, PLAIN);
    $[0] = locale;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const digits = t1;
  const moreText = (n_0) => (props.moreLabel || sds.labels.avatarMore)(n_0, displayNumber(n_0, locale)).replace(new RegExp("(?<!\\d)" + n_0 + "(?!\\d)", "g"), digits(n_0));
  const moreName = moreText(more);
  const t2 = more > cap ? digits(cap) + "+" : "+" + digits(more);
  let t3;
  if ($[2] !== t2) {
    t3 = /* @__PURE__ */ React.createElement("span", { className: "srp-avatar__frame" }, /* @__PURE__ */ React.createElement("span", { className: "srp-avatar__initials", "aria-hidden": "true" }, t2));
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const face = t3;
  const cls = "srp-avatar srp-avatar--" + size + " srp-avatar-group__more";
  const plus = (onClick) => props.onMore || props.showMore ? /* @__PURE__ */ React.createElement("button", { type: "button", className: cls, "aria-label": moreName, onClick, "data-component": "avatar", "data-size": size }, face) : /* @__PURE__ */ React.createElement("span", { className: cls, role: "img", "aria-label": moreName, "data-component": "avatar", "data-size": size }, face);
  let t4;
  if ($[4] !== count) {
    t4 = (el, i) => /* @__PURE__ */ React.createElement("span", { key: el.key ?? i, className: "srp-avatar-group__item", style: {
      zIndex: count - i
    } }, el);
    $[4] = count;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: restyle, role: "group", className: cn("srp-avatar-group", "srp-avatar-group--" + size, props.className), "data-component": "avatar-group", "data-size": size }, /* @__PURE__ */ React.createElement(AvatarGroupSize.Provider, { value: size }, shown.map(t4)), more > 0 ? /* @__PURE__ */ React.createElement("span", { className: "srp-avatar-group__item", style: {
    zIndex: 1
  } }, props.onMore || !props.showMore ? plus(props.onMore) : /* @__PURE__ */ React.createElement(Popover, { trigger: plus(), "aria-label": moreName, placement: "bottom-start" }, /* @__PURE__ */ React.createElement("ul", { className: "srp-avatar-group__list", role: "list" }, all.slice(shown.length).map(_temp), total > all.length ? /* @__PURE__ */ React.createElement("li", null, moreText(total - all.length)) : null))) : null);
}
function _temp(el_0, i_0) {
  const name = el_0.props.name;
  return /* @__PURE__ */ React.createElement("li", { key: el_0.key ?? i_0 }, name ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(AvatarGroupSize.Provider, { value: "xs" }, React.cloneElement(el_0, {
    alt: ""
  })), name) : el_0);
}
var AvatarGroup = /* @__PURE__ */ named("AvatarGroup", AvatarGroupRender);
export {
  AvatarGroup
};
//# sourceMappingURL=AvatarGroup.js.map
