// src/components/Button/buttonClass.ts
import { cn, oneOf, SIZES } from "../../internal/cn.js";
var BUTTON_VARIANTS = ["primary", "secondary", "outline", "ghost", "link"];
function buttonClass(opts) {
  opts = opts || {};
  const v = oneOf(BUTTON_VARIANTS, opts.variant, "primary");
  const s = oneOf(SIZES, opts.size, "md");
  const iconOnly = !!opts.iconOnly, pos = opts.iconPosition;
  return cn("srp-btn", "srp-btn--" + v, opts.destructive && "srp-btn--destructive", "srp-btn--size-" + s, iconOnly && "srp-btn--icon-only", !iconOnly && (pos === "start" || pos === "end") && "srp-btn--icon-" + pos, !iconOnly && opts.wrap && "srp-btn--wrap", opts.className);
}
export {
  BUTTON_VARIANTS,
  buttonClass
};
//# sourceMappingURL=buttonClass.js.map
