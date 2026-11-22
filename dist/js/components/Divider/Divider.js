// src/components/Divider/Divider.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
function DividerRender({ ref, ...props }) {
  const rest = omit(props, { orientation: 1, label: 1, decorative: 1, onMedia: 1, className: 1 });
  const vertical = props.orientation === "vertical";
  const label = props.label != null && props.label !== false && props.label !== "" && !vertical ? props.label : null;
  const cls = cn("srp-divider", vertical && "srp-divider--vertical", label != null && "srp-divider--label", (props.onMedia === "dark" || props.onMedia === "light") && "srp-divider--on-" + props.onMedia, props.className);
  const a11y = props.decorative ? { role: "none", "aria-hidden": true } : { role: "separator", "aria-orientation": vertical ? "vertical" : void 0 };
  if (label != null && !props.decorative) {
    if (typeof label === "string" || typeof label === "number") {
      if (rest["aria-label"] == null) a11y["aria-label"] = String(label);
    } else {
      delete a11y.role;
    }
  }
  if (label == null && !vertical) return /* @__PURE__ */ React.createElement("hr", { ...rest, ...a11y, ref, className: cls, "data-component": "divider", role: props.decorative ? "none" : void 0 });
  return /* @__PURE__ */ React.createElement("div", { ...rest, ...a11y, ref, className: cls, "data-component": "divider" }, label != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-divider__label" }, label) : null);
}
var Divider = /* @__PURE__ */ named("Divider", DividerRender);
export {
  Divider
};
//# sourceMappingURL=Divider.js.map
