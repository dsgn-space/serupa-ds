// src/components/Text/Text.tsx
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var TAGS = ["p", "span", "div", "label", "strong", "em", "small", "li", "figcaption"];
var SIZES = ["xs", "sm", "base", "lg", "xl"];
var TONES = ["neutral", "muted", "primary", "danger"];
var WEIGHTS = ["normal", "medium", "semibold", "bold"];
var pick = (list, v) => list.indexOf(v) < 0 ? null : v;
function TextRender({ ref, ...props }) {
  const { as, size, tone, weight, truncate, lines, measure, className, ...rest } = props;
  const clamp = !truncate && lines != null && lines >= 1 ? Math.min(6, Math.floor(lines)) : 0;
  const s = pick(SIZES, size), t = pick(TONES, tone), w = pick(WEIGHTS, weight);
  return React.createElement(oneOf(TAGS, as, "p"), Object.assign(rest, {
    ref,
    "data-component": "text",
    // The count goes in an attribute the CSS reads, not a style attribute, so it holds under a strict CSP too.
    "data-lines": clamp || void 0,
    className: cn("srp-text", s && "srp-text--" + s, t && "srp-text--" + t, w && "srp-text--" + w, truncate && "srp-text--truncate", clamp && "srp-text--clamp", measure && "srp-text--measure", className)
  }));
}
var Text = /* @__PURE__ */ named("Text", TextRender);
export {
  Text
};
//# sourceMappingURL=Text.js.map
