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
    headingLevel: t1,
    variant: t2,
    label,
    placement: t3,
    className,
    ...rest
  } = props;
  const headingLevel = t1 === void 0 ? 3 : t1;
  const variant = t2 === void 0 ? "help" : t2;
  const placement = t3 === void 0 ? "bottom-start" : t3;
  const info = variant === "info";
  const name = label || (info ? sds.labels.contextualInfo : sds.labels.contextualHelp);
  const t4 = info && "srp-contextual-help__button--info";
  let t5;
  if ($[0] !== t4) {
    t5 = cn("srp-contextual-help__button", t4);
    $[0] = t4;
    $[1] = t5;
  } else {
    t5 = $[1];
  }
  const t6 = info ? icons.Info : icons.Help;
  let t7;
  if ($[2] !== t6) {
    t7 = /* @__PURE__ */ React.createElement(Icon, { icon: t6 });
    $[2] = t6;
    $[3] = t7;
  } else {
    t7 = $[3];
  }
  const trigger = /* @__PURE__ */ React.createElement(IconButton, { className: t5, shape: "round", size: "sm", icon: t7, label: name });
  return /* @__PURE__ */ React.createElement(Popover, { ...rest, ref, trigger, title, headingLevel, placement, "aria-label": title == null ? name : void 0, className: cn("srp-contextual-help", className) }, children);
}
var ContextualHelp = /* @__PURE__ */ named("ContextualHelp", ContextualHelpRender);
export {
  ContextualHelp
};
//# sourceMappingURL=ContextualHelp.js.map
