// src/internal/loaderRing.tsx
import * as React from "react";
import { cn } from "./cn.js";
function RingArt() {
  return /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__track", cx: 12, cy: 12, r: 10 }), /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__arc", cx: 12, cy: 12, r: 10, pathLength: 100, strokeDasharray: "25 150" }));
}
function LoaderRing({ className, size = "md" }) {
  return /* @__PURE__ */ React.createElement("span", { "data-component": "loader", "data-variant": "ring", "data-size": size, "aria-hidden": true, className: cn("srp-loader", "srp-loader--ring", "srp-loader--size-" + size, className) }, /* @__PURE__ */ React.createElement("span", { className: "srp-loader__art" }, /* @__PURE__ */ React.createElement(RingArt, null)));
}
export {
  LoaderRing,
  RingArt
};
//# sourceMappingURL=loaderRing.js.map
