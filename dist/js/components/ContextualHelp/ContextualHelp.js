"use client";

// src/components/ContextualHelp/ContextualHelp.tsx
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { Popover } from "../Popover/Popover.js";
import { en as words } from "./labels.js";
var ContextualHelp = /* @__PURE__ */ component("ContextualHelp", function ContextualHelp2(props, ref) {
  const sds = useSettings(words);
  const { children, title, headingLevel = 3, variant = "help", label, placement = "bottom-start", className, ...rest } = props;
  const info = variant === "info";
  const name = label || (info ? sds.labels.contextualInfo : sds.labels.contextualHelp);
  const trigger = /* @__PURE__ */ React.createElement(
    IconButton,
    {
      className: cn("dk-contextual-help__button", info && "dk-contextual-help__button--info"),
      shape: "round",
      size: "sm",
      icon: /* @__PURE__ */ React.createElement(Icon, { icon: info ? icons.Info : icons.Help }),
      label: name
    }
  );
  return /* @__PURE__ */ React.createElement(
    Popover,
    {
      ...rest,
      ref,
      trigger,
      title,
      headingLevel,
      placement,
      "aria-label": title == null ? name : void 0,
      className: cn("dk-contextual-help", className)
    },
    children
  );
});
export {
  ContextualHelp
};
//# sourceMappingURL=ContextualHelp.js.map
