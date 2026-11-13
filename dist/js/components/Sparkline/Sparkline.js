"use client";

// src/components/Sparkline/Sparkline.tsx
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { en as words } from "./labels.js";
var W = 100;
var H = 30;
var PAD = 4;
var at = (x) => Math.round(x * 100) / 100;
var Sparkline = /* @__PURE__ */ component("Sparkline", function Sparkline2(props, ref) {
  const rest = omit(props, { data: 1, label: 1, format: 1, area: 1, min: 1, max: 1, className: 1 });
  const sds = useSettings(words), locale = useLocale();
  const data = (props.data || []).filter((v) => typeof v === "number" && isFinite(v));
  let low = Infinity, high = -Infinity;
  for (const v of data) {
    if (v < low) low = v;
    if (v > high) high = v;
  }
  const lo = typeof props.min === "number" && isFinite(props.min) ? props.min : low;
  const hi = typeof props.max === "number" && isFinite(props.max) ? props.max : high;
  const x = (i) => at(data.length > 1 ? i / (data.length - 1) * W : W / 2);
  const y = (v) => at(hi > lo ? PAD + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (H - 2 * PAD) : H / 2);
  const line = data.map((v, i) => (i ? "L" : "M") + x(i) + " " + y(v)).join("");
  const last = data.length - 1;
  const fmt = (v) => displayNumber(v, locale, props.format);
  const name = data.length ? sds.labels.sparklineSummary(props.label, fmt(data[0]), fmt(data[last]), fmt(low), fmt(high)) : props.label;
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", width: "2em", height: "0.5em", role: "img", "aria-label": name, focusable: "false", ...rest, ref, className: cn("dk-sparkline", props.className), "data-component": "sparkline" }, props.area && data.length > 1 ? /* @__PURE__ */ React.createElement("path", { className: "dk-sparkline__area", d: line + "L" + W + " " + H + "L0 " + H + "Z" }) : null, data.length > 1 ? /* @__PURE__ */ React.createElement("path", { className: "dk-sparkline__line", d: line, vectorEffect: "non-scaling-stroke" }) : null, data.length ? /* @__PURE__ */ React.createElement("path", { className: "dk-sparkline__dot", d: "M" + x(last) + " " + y(data[last]) + "Z", vectorEffect: "non-scaling-stroke" }) : null);
});
export {
  Sparkline
};
//# sourceMappingURL=Sparkline.js.map
