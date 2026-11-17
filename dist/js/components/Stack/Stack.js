// src/components/Stack/Stack.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { atWidths, space, WIDTHS } from "../../internal/space.js";
import { component } from "../../internal/component.js";
var TAGS = ["div", "section", "ul", "ol", "nav", "header", "footer", "form", "fieldset", "span"];
var ALIGNS = ["stretch", "start", "center", "end", "baseline"];
var GAP = "var(--stack-gap, var(--spacing-4))";
var Stack = /* @__PURE__ */ component("Stack", function Stack2(props, ref) {
  const rest = omit(props, { direction: 1, gap: 1, align: 1, justify: 1, wrap: 1, as: 1, className: 1, style: 1 });
  const dirs = atWidths(props.direction), aligns = atWidths(props.align), gaps = atWidths(props.gap);
  const dirAt = (d) => d === "row" ? "row" : "column";
  const alignAt = (a, d) => oneOf(ALIGNS, a, d === "row" ? "center" : "stretch");
  const dir = dirAt(dirs ? dirs.base : props.direction);
  const align = alignAt(aligns ? aligns.base : props.align, dir);
  const row = dir === "row";
  const justify = oneOf(["start", "center", "end", "between"], props.justify, "start");
  const widths = [];
  const vars = {};
  if (dirs || aligns) {
    let d = dir, a = align;
    for (const w of WIDTHS) {
      const dw = dirAt(dirs ? dirs[w] : props.direction), aw = alignAt(aligns ? aligns[w] : props.align, dw);
      if (dw !== d) widths.push("dk-stack--" + w + "-" + dw);
      if (aw !== a) widths.push("dk-stack--" + w + "-align-" + aw);
      d = dw;
      a = aw;
    }
  }
  if (gaps) {
    vars["--dk-stack-gap-base"] = space(gaps.base) || GAP;
    for (const w of WIDTHS) vars["--dk-stack-gap-" + w] = space(gaps[w]) || GAP;
    widths.push("dk-stack--gaps");
  } else {
    const gap = space(props.gap);
    if (gap) vars["--dk-stack-gap"] = gap;
  }
  const tag = oneOf(TAGS, props.as, "div");
  return React.createElement(tag, Object.assign(rest, {
    ref,
    "data-component": "stack",
    role: rest.role ?? (tag === "ul" || tag === "ol" ? "list" : void 0),
    className: cn("dk-stack", row && "dk-stack--row", "dk-stack--align-" + align, justify !== "start" && "dk-stack--justify-" + justify, props.wrap && "dk-stack--wrap", widths.join(" "), props.className),
    style: Object.keys(vars).length ? Object.assign(vars, props.style) : props.style
  }));
});
export {
  Stack
};
//# sourceMappingURL=Stack.js.map
