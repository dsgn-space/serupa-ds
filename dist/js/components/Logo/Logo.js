"use client";

// src/components/Logo/Logo.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, useMergedRef } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { schemeOf, useThemeChanges } from "../../internal/scheme.js";
var BELOW = {
  sm: "(max-width: 639.98px)",
  md: "(max-width: 767.98px)",
  lg: "(max-width: 1023.98px)"
};
function both(a, b) {
  return a === null || b === null ? null : a === "all" ? b : b === "all" ? a : a + " and " + b;
}
function LogoRender(t0) {
  const $ = _c(15);
  const {
    ref,
    ...props
  } = t0;
  const {
    src,
    alt,
    darkSrc,
    markSrc,
    markDarkSrc,
    variant,
    collapseBelow,
    size,
    className,
    ...rest
  } = props;
  const img = React.useRef(null);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = (n) => {
      img.current = n;
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const mergedRef = useMergedRef(ref, t1);
  const dark = !!(darkSrc || markDarkSrc);
  const themes = useThemeChanges(dark);
  const [scheme, setScheme] = React.useState(null);
  let t2;
  if ($[1] !== dark) {
    t2 = () => {
      if (dark && img.current) {
        setScheme(schemeOf(img.current));
      }
    };
    $[1] = dark;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== dark || $[4] !== themes) {
    t3 = [dark, themes];
    $[3] = dark;
    $[4] = themes;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  React.useEffect(t2, t3);
  const darkMedia = scheme === "dark" ? "all" : scheme === "light" ? null : "(prefers-color-scheme: dark)";
  const v = oneOf(["full", "mark", "auto"], variant, "full");
  const mark = markSrc && v !== "full" ? v === "mark" ? "all" : BELOW[oneOf(["sm", "md", "lg"], collapseBelow, "md")] : null;
  const sources = [[markDarkSrc, both(mark, darkMedia)], [markSrc, mark === "all" ? null : mark], [darkSrc, mark === "all" ? null : darkMedia]];
  const offered = sources.filter(_temp);
  const t4 = mark === "all" ? markSrc : src;
  const t5 = cn("srp-logo", "srp-logo--" + oneOf(["sm", "md", "lg"], size, "md"), className);
  let t6;
  if ($[6] !== alt || $[7] !== mergedRef || $[8] !== rest || $[9] !== t4 || $[10] !== t5) {
    t6 = /* @__PURE__ */ React.createElement("img", { ...rest, ref: mergedRef, src: t4, alt, className: t5, "data-component": "logo" });
    $[6] = alt;
    $[7] = mergedRef;
    $[8] = rest;
    $[9] = t4;
    $[10] = t5;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  const picture = t6;
  let t7;
  if ($[12] !== offered || $[13] !== picture) {
    t7 = offered.length ? /* @__PURE__ */ React.createElement("picture", { className: "srp-logo__picture" }, offered.map(_temp2), picture) : picture;
    $[12] = offered;
    $[13] = picture;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  return t7;
}
function _temp2(t0) {
  const [s_0, media] = t0;
  return /* @__PURE__ */ React.createElement("source", { key: s_0 + media, srcSet: s_0, media });
}
function _temp(s) {
  return !!s[0] && s[1] !== null;
}
var Logo = /* @__PURE__ */ named("Logo", LogoRender);
export {
  Logo
};
//# sourceMappingURL=Logo.js.map
