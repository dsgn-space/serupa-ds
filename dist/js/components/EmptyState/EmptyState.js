// src/components/EmptyState/EmptyState.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { asIcon } from "../Icon/asIcon.js";
import { named } from "../../internal/component.js";
import { AnnounceText } from "./AnnounceText.js";
import { ClearFilters, Suggestions } from "./NoResults.js";
function EmptyStateRender({ ref, ...props }) {
  const rest = omit(props, { icon: 1, title: 1, description: 1, actions: 1, size: 1, variant: 1, headingLevel: 1, announce: 1, suggestions: 1, onSuggestion: 1, onClearFilters: 1, className: 1 });
  const size = oneOf(["sm", "md"], props.size, "md");
  const variant = oneOf(["plain", "dashed"], props.variant, "plain");
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel) >= 0 ? props.headingLevel : 3;
  const H = "h" + level;
  const icon = asIcon(props.icon);
  const suggestions = (props.suggestions || []).filter(Boolean);
  const clear = props.onClearFilters ? /* @__PURE__ */ React.createElement(ClearFilters, { action: props.onClearFilters, small: size === "sm" }) : null;
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, "data-component": "empty-state", className: cn("srp-empty-state", size === "sm" && "srp-empty-state--sm", variant === "dashed" && "srp-empty-state--dashed", props.className) }, icon != null ? /* @__PURE__ */ React.createElement("div", { className: cn("srp-empty-state__icon", typeof props.icon !== "string" && "srp-empty-state__icon--custom"), "aria-hidden": "true" }, icon) : null, /* @__PURE__ */ React.createElement("div", { className: "srp-empty-state__text" }, /* @__PURE__ */ React.createElement(H, { className: "srp-empty-state__title" }, props.title), props.description != null ? /* @__PURE__ */ React.createElement("p", { className: "srp-empty-state__description" }, props.description) : null, suggestions.length ? /* @__PURE__ */ React.createElement(Suggestions, { items: suggestions, pick: props.onSuggestion }) : null, props.announce ? /* @__PURE__ */ React.createElement(AnnounceText, null) : null), props.actions != null || clear ? /* @__PURE__ */ React.createElement("div", { className: "srp-empty-state__actions" }, props.actions, clear) : null);
}
var EmptyState = /* @__PURE__ */ named("EmptyState", EmptyStateRender);
export {
  EmptyState
};
//# sourceMappingURL=EmptyState.js.map
