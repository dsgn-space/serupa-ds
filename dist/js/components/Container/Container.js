// src/components/Container/Container.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var SIZES = ["prose", "md", "lg", "xl", "2xl", "full"];
var TAGS = ["div", "main", "section", "header", "footer", "article"];
function ContainerRender({ ref, ...props }) {
  const rest = omit(props, { size: 1, padded: 1, as: 1, className: 1 });
  const size = oneOf(SIZES, props.size, "xl");
  return React.createElement(oneOf(TAGS, props.as, "div"), Object.assign(rest, {
    ref,
    "data-component": "container",
    "data-size": size,
    className: cn("srp-container", "srp-container--" + size, props.padded !== false && "srp-container--padded", props.className)
  }));
}
var Container = /* @__PURE__ */ named("Container", ContainerRender);
export {
  Container
};
//# sourceMappingURL=Container.js.map
