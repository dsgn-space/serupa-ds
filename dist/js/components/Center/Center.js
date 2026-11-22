// src/components/Center/Center.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var TAGS = ["div", "main", "section", "article"];
function CenterRender({ ref, ...props }) {
  const rest = omit(props, { maxWidth: 1, vertical: 1, intrinsic: 1, centerText: 1, padded: 1, as: 1, className: 1, style: 1 });
  const max = props.maxWidth;
  const vars = {};
  if (max) vars["--srp-center-max"] = /^[a-z][a-z0-9-]*$/.test(max) ? "var(--" + max + ")" : max;
  return React.createElement(oneOf(TAGS, props.as, "div"), Object.assign(rest, {
    ref,
    "data-component": "center",
    className: cn("srp-center", props.vertical && "srp-center--vertical", props.intrinsic && "srp-center--intrinsic", props.centerText && "srp-center--text", props.padded !== false && "srp-center--padded", props.className),
    style: max ? Object.assign(vars, props.style) : props.style
  }));
}
var Center = /* @__PURE__ */ named("Center", CenterRender);
export {
  Center
};
//# sourceMappingURL=Center.js.map
