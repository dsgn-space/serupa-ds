// src/components/Grid/Grid.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { atWidths, space, WIDTHS } from "../../internal/space.js";
import { component } from "../../internal/component.js";
var TAGS = ["div", "section", "ul", "ol"];
var GAP = "var(--grid-gap, var(--spacing-4))";
var count = (c) => {
  const n = typeof c === "number" ? Math.round(c) : 0;
  return n >= 1 && n <= 12 ? n : 0;
};
var Grid = /* @__PURE__ */ component("Grid", function Grid2(props, ref) {
  const rest = omit(props, { columns: 1, minColumnWidth: 1, fill: 1, gap: 1, as: 1, className: 1, style: 1 });
  const map = atWidths(props.columns);
  const cols = map ? count(map.base) || 1 : count(props.columns);
  const vars = {};
  const widths = [];
  if (map) {
    vars["--dk-grid-cols-base"] = String(cols);
    for (const w of WIDTHS) vars["--dk-grid-cols-" + w] = String(count(map[w]) || cols);
    widths.push("dk-grid--cols");
  } else if (cols) vars["--dk-grid-cols"] = String(cols);
  const gaps = atWidths(props.gap);
  if (gaps) {
    vars["--dk-grid-gap-base"] = space(gaps.base) || GAP;
    for (const w of WIDTHS) vars["--dk-grid-gap-" + w] = space(gaps[w]) || GAP;
    widths.push("dk-grid--gaps");
  } else {
    const gap = space(props.gap);
    if (gap) vars["--dk-grid-gap"] = gap;
  }
  const kind = !cols ? "auto" : props.minColumnWidth ? "upto" : "fixed";
  if (props.minColumnWidth) vars["--dk-grid-min"] = /^[a-z][a-z0-9-]*$/.test(props.minColumnWidth) ? "var(--" + props.minColumnWidth + ")" : props.minColumnWidth;
  const tag = oneOf(TAGS, props.as, "div");
  return React.createElement(tag, Object.assign(rest, {
    ref,
    "data-component": "grid",
    role: rest.role ?? (tag === "ul" || tag === "ol" ? "list" : void 0),
    className: cn("dk-grid", "dk-grid--" + kind, props.fill && kind !== "fixed" && "dk-grid--fill", widths.join(" "), props.className),
    style: Object.assign(vars, props.style)
  }));
});
export {
  Grid
};
//# sourceMappingURL=Grid.js.map
