// src/components/Illustration/Illustration.tsx
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
var NAMES = ["empty", "search", "error", "offline", "no-access", "success"];
var DOC = "M36 16H88L104 32V104H36Z";
var PICTURES = {
  empty: [
    ["fill", "M40 52L80 40L120 52V92L80 104L40 92Z"],
    ["line", "M40 52L80 40L120 52V92L80 104L40 92Z"],
    ["line", "M40 52L80 64L120 52M80 64V104M40 52L28 38L68 26L80 40M120 52L132 38L92 26L80 40"],
    ["accent", "M80 6V16M60 12L65 20M100 12L95 20"]
  ],
  search: [
    ["fill", DOC],
    ["line", DOC],
    ["line", "M88 16V32H104M50 42H88M50 54H78"],
    ["fill", "M96 58A18 18 0 1 1 96 94A18 18 0 1 1 96 58Z"],
    ["accent", "M96 58A18 18 0 1 1 96 94A18 18 0 1 1 96 58ZM109 89L124 104"]
  ],
  error: [
    ["fill", DOC],
    ["line", DOC],
    ["line", "M88 16V32H104M50 42H88M50 54H78"],
    ["fill", "M100 60L126 106H74Z"],
    ["accent", "M100 60L126 106H74ZM100 76V90M100 98V98.5"]
  ],
  offline: [
    ["fill", "M50 92H110A20 20 0 0 0 112 52A30 30 0 0 0 54 50A21 21 0 0 0 50 92Z"],
    ["line", "M50 92H110A20 20 0 0 0 112 52A30 30 0 0 0 54 50A21 21 0 0 0 50 92Z"],
    ["accent", "M44 22L116 104"]
  ],
  "no-access": [
    ["line", "M60 56V42A20 20 0 0 1 100 42V56"],
    ["fill", "M56 56H104A8 8 0 0 1 112 64V100A8 8 0 0 1 104 108H56A8 8 0 0 1 48 100V64A8 8 0 0 1 56 56Z"],
    ["line", "M56 56H104A8 8 0 0 1 112 64V100A8 8 0 0 1 104 108H56A8 8 0 0 1 48 100V64A8 8 0 0 1 56 56Z"],
    ["accent", "M80 74V90"]
  ],
  success: [
    ["fill", "M80 20A40 40 0 1 1 80 100A40 40 0 1 1 80 20Z"],
    ["line", "M80 20A40 40 0 1 1 80 100A40 40 0 1 1 80 20Z"],
    ["accent", "M62 60L75 73L99 49"]
  ]
};
var Illustration = /* @__PURE__ */ component("Illustration", function Illustration2(props, ref) {
  const rest = omit(props, { className: 1, name: 1, size: 1, label: 1 });
  const label = props.label;
  const name = oneOf(NAMES, props.name, "empty");
  const size = oneOf(["sm", "md", "lg"], props.size, "md");
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 160 120", width: "1em", height: "0.75em", focusable: "false", ...a11y, ...rest, ref, className: cn("dk-illustration", size !== "md" && "dk-illustration--" + size, props.className), "data-component": "illustration", "data-name": name }, PICTURES[name].map(([kind, d], i) => /* @__PURE__ */ React.createElement("path", { key: i, className: "dk-illustration__" + kind, d, strokeWidth: kind === "accent" ? 4 : kind === "line" ? 3 : void 0 })));
});
export {
  Illustration
};
//# sourceMappingURL=Illustration.js.map
