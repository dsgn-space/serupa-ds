"use client";

// src/components/ContextualHelp/ContextualHelp.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import * as icons from "../../material/builtin.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Icon } from "../Icon/Icon.js";
import { Popover } from "../Popover/Popover.js";
import { en as words } from "./labels.js";
function ContextualHelpRender(t0) {
  const $ = _c(4);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const {
    children,
    title,
    headingLevel: headingLevelProp,
    variant: variantProp,
    label,
    placement: placementProp,
    className,
    ...rest
  } = props;
  const headingLevel = headingLevelProp === void 0 ? 3 : headingLevelProp;
  const variant = variantProp === void 0 ? "help" : variantProp;
  const placement = placementProp === void 0 ? "bottom-start" : placementProp;
  const info = variant === "info";
  const name = label || (info ? sds.labels.contextualInfo : sds.labels.contextualHelp);
  const t1 = info && "srp-contextual-help__button--info";
  let t2;
  if ($[0] !== t1) {
    t2 = cn("srp-contextual-help__button", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const t3 = info ? icons.Info : icons.Help;
  let t4;
  if ($[2] !== t3) {
    t4 = /* @__PURE__ */ React.createElement(Icon, { icon: t3 });
    $[2] = t3;
    $[3] = t4;
  } else {
    t4 = $[3];
  }
  const trigger = /* @__PURE__ */ React.createElement(IconButton, { className: t2, shape: "round", size: "sm", icon: t4, label: name });
  return /* @__PURE__ */ React.createElement(Popover, { ...rest, ref, trigger, title, headingLevel, placement, "aria-label": title == null ? name : void 0, className: cn("srp-contextual-help", className) }, children);
}
var ContextualHelp = /* @__PURE__ */ named("ContextualHelp", ContextualHelpRender);
export {
  ContextualHelp
};
//# sourceMappingURL=ContextualHelp.js.map
