// src/components/Grid/Grid.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { atWidths, space, WIDTHS } from "../../internal/space.js";
import { named } from "../../internal/component.js";
var TAGS = ["div", "section", "ul", "ol"];
var GAP = "var(--grid-gap, var(--spacing-4))";
var count = (c) => {
  const n = typeof c === "number" ? Math.round(c) : 0;
  return n >= 1 && n <= 12 ? n : 0;
};
function GridRender({ ref, ...props }) {
  const rest = omit(props, { columns: 1, minColumnWidth: 1, fill: 1, gap: 1, as: 1, className: 1, style: 1 });
  const map = atWidths(props.columns);
  const cols = map ? count(map.base) || 1 : count(props.columns);
  const vars = {};
  const widths = [];
  if (map) {
    vars["--srp-grid-cols-base"] = String(cols);
    for (const w of WIDTHS) vars["--srp-grid-cols-" + w] = String(count(map[w]) || cols);
    widths.push("srp-grid--cols");
  } else if (cols) vars["--srp-grid-cols"] = String(cols);
  const gaps = atWidths(props.gap);
  if (gaps) {
    vars["--srp-grid-gap-base"] = space(gaps.base) || GAP;
    for (const w of WIDTHS) vars["--srp-grid-gap-" + w] = space(gaps[w]) || GAP;
    widths.push("srp-grid--gaps");
  } else {
    const gap = space(props.gap);
    if (gap) vars["--srp-grid-gap"] = gap;
  }
  const kind = !cols ? "auto" : props.minColumnWidth ? "upto" : "fixed";
  if (props.minColumnWidth) vars["--srp-grid-min"] = /^[a-z][a-z0-9-]*$/.test(props.minColumnWidth) ? "var(--" + props.minColumnWidth + ")" : props.minColumnWidth;
  const tag = oneOf(TAGS, props.as, "div");
  return React.createElement(tag, Object.assign(rest, {
    ref,
    "data-component": "grid",
    role: rest.role ?? (tag === "ul" || tag === "ol" ? "list" : void 0),
    className: cn("srp-grid", "srp-grid--" + kind, props.fill && kind !== "fixed" && "srp-grid--fill", widths.join(" "), props.className),
    style: Object.assign(vars, props.style)
  }));
}
var Grid = /* @__PURE__ */ named("Grid", GridRender);
export {
  Grid
};
//# sourceMappingURL=Grid.js.map
