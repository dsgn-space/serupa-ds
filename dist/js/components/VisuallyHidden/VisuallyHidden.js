// src/components/VisuallyHidden/VisuallyHidden.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var TAGS = ["span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "p", "label", "legend"];
function VisuallyHiddenRender({ ref, ...props }) {
  const rest = omit(props, { focusable: 1, as: 1, className: 1 });
  return React.createElement(oneOf(TAGS, props.as, "span"), Object.assign(rest, {
    ref,
    "data-component": "visually-hidden",
    className: cn("srp-visually-hidden", props.focusable && "srp-visually-hidden--focusable", props.className)
  }));
}
var VisuallyHidden = /* @__PURE__ */ named("VisuallyHidden", VisuallyHiddenRender);
export {
  VisuallyHidden
};
//# sourceMappingURL=VisuallyHidden.js.map
