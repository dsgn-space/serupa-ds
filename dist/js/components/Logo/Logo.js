"use client";

// src/components/Logo/Logo.tsx
import * as React from "react";
import { cn, oneOf, useMergedRef } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { schemeOf, useThemeChanges } from "../../internal/scheme.js";
var BELOW = { sm: "(max-width: 639.98px)", md: "(max-width: 767.98px)", lg: "(max-width: 1023.98px)" };
function both(a, b) {
  return a === null || b === null ? null : a === "all" ? b : b === "all" ? a : a + " and " + b;
}
var Logo = /* @__PURE__ */ component("Logo", function Logo2(props, ref) {
  const { src, alt, darkSrc, markSrc, markDarkSrc, variant, collapseBelow, size, className, ...rest } = props;
  const img = React.useRef(null);
  const mergedRef = useMergedRef(ref, (n) => {
    img.current = n;
  });
  const dark = !!(darkSrc || markDarkSrc);
  const themes = useThemeChanges(dark);
  const [scheme, setScheme] = React.useState(null);
  React.useEffect(() => {
    if (dark && img.current) setScheme(schemeOf(img.current));
  }, [dark, themes]);
  const darkMedia = scheme === "dark" ? "all" : scheme === "light" ? null : "(prefers-color-scheme: dark)";
  const v = oneOf(["full", "mark", "auto"], variant, "full");
  const mark = markSrc && v !== "full" ? v === "mark" ? "all" : BELOW[oneOf(["sm", "md", "lg"], collapseBelow, "md")] : null;
  const sources = [
    [markDarkSrc, both(mark, darkMedia)],
    [markSrc, mark === "all" ? null : mark],
    [darkSrc, mark === "all" ? null : darkMedia]
  ];
  const offered = sources.filter((s) => !!s[0] && s[1] !== null);
  const picture = /* @__PURE__ */ React.createElement(
    "img",
    {
      ...rest,
      ref: mergedRef,
      src: mark === "all" ? markSrc : src,
      alt,
      className: cn("dk-logo", "dk-logo--" + oneOf(["sm", "md", "lg"], size, "md"), className),
      "data-component": "logo"
    }
  );
  return offered.length ? /* @__PURE__ */ React.createElement("picture", { className: "dk-logo__picture" }, offered.map(([s, media]) => /* @__PURE__ */ React.createElement("source", { key: s + media, srcSet: s, media })), picture) : picture;
});
export {
  Logo
};
//# sourceMappingURL=Logo.js.map
