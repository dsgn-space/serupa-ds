// src/components/IconButton/IconButton.tsx
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { ButtonBase } from "../Button/Button.js";
import { component } from "../../internal/component.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
var IconButton = /* @__PURE__ */ component("IconButton", function IconButton2(props, ref) {
  const { icon, label, shape, hideTitle, className, ...rest } = props;
  const round = shape === "round";
  const own = hideTitle || rest.title != null || rest["aria-describedby"] != null || rest["aria-labelledby"] != null;
  const name = label || rest["aria-label"];
  const button = /* @__PURE__ */ React.createElement(
    ButtonBase,
    {
      variant: "ghost",
      ...rest,
      "aria-label": name,
      "data-shape": round ? "round" : "square",
      ref,
      icon,
      className: cn("dk-icon-btn", round && "dk-icon-btn--round", className)
    }
  );
  return own || !name ? button : /* @__PURE__ */ React.createElement(Tooltip, { content: name, role: "label", disabled: !!rest.disabled }, button);
});
export {
  IconButton
};
//# sourceMappingURL=IconButton.js.map
