"use client";

// src/components/SkipLink/SkipLink.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { warnOnce } from "../../internal/warn.js";
import { en as words } from "./labels.js";
var FOCUSABLE = "a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]";
function SkipLinkRender(t0) {
  const $ = _c(7);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    target: 1,
    className: 1,
    children: 1,
    onClick: 1
  });
  const labels = useSettings(words).labels;
  const target = props.target || "main";
  const onClick = props.onClick;
  const follow = function(e) {
    if (onClick) {
      onClick(e);
    }
    if (e.defaultPrevented) {
      return;
    }
    const root = e.currentTarget.getRootNode();
    const to = (typeof root.getElementById === "function" ? root : document).getElementById(target);
    if (!to) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce("skip-link-target", 'SkipLink: no element with id "' + target + '" on the page. Give the main content that id (<main id="main">), or pass its id as target.');
      }
      return;
    }
    e.preventDefault();
    if (!to.matches(FOCUSABLE)) {
      to.setAttribute("tabindex", "-1");
      to.addEventListener("blur", function() {
        to.removeAttribute("tabindex");
      }, {
        once: true
      });
    }
    to.focus();
    if (typeof history !== "undefined" && history.replaceState && location.hash !== "#" + target) {
      history.replaceState(history.state, "", "#" + target);
    }
  };
  const t1 = "#" + target;
  const t2 = cn("srp-skip-link", props.className);
  const t3 = props.children != null ? props.children : labels.skipToContent;
  let t4;
  if ($[0] !== follow || $[1] !== ref || $[2] !== rest || $[3] !== t1 || $[4] !== t2 || $[5] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("a", { ...rest, ref, href: t1, onClick: follow, className: t2, "data-component": "skip-link" }, t3);
    $[0] = follow;
    $[1] = ref;
    $[2] = rest;
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  return t4;
}
var SkipLink = /* @__PURE__ */ named("SkipLink", SkipLinkRender);
export {
  SkipLink
};
//# sourceMappingURL=SkipLink.js.map
