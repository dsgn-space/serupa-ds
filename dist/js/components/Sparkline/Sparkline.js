"use client";

// src/components/Sparkline/Sparkline.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { en as words } from "./labels.js";
var W = 100;
var H = 30;
var PAD = 4;
var at = (x) => Math.round(x * 100) / 100;
function SparklineRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    data: 1,
    label: 1,
    format: 1,
    area: 1,
    min: 1,
    max: 1,
    className: 1
  });
  const sds = useSettings(words);
  const locale = useLocale();
  const data = (props.data || []).filter(_temp);
  let low = Infinity;
  let high = -Infinity;
  for (const v_0 of data) {
    if (v_0 < low) {
      low = v_0;
    }
    if (v_0 > high) {
      high = v_0;
    }
  }
  const lo = typeof props.min === "number" && isFinite(props.min) ? props.min : low;
  const hi = typeof props.max === "number" && isFinite(props.max) ? props.max : high;
  const x = (i) => at(data.length > 1 ? i / (data.length - 1) * W : W / 2);
  const y = (v_1) => at(hi > lo ? PAD + (1 - (Math.min(Math.max(v_1, lo), hi) - lo) / (hi - lo)) * (H - 2 * PAD) : H / 2);
  let t1;
  if ($[0] !== x || $[1] !== y) {
    t1 = (v_2, i_0) => (i_0 ? "L" : "M") + x(i_0) + " " + y(v_2);
    $[0] = x;
    $[1] = y;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const line = data.map(t1).join("");
  const last = data.length - 1;
  const fmt = (v_3) => displayNumber(v_3, locale, props.format);
  const name = data.length ? sds.labels.sparklineSummary(props.label, fmt(data[0] ?? 0), fmt(data[last] ?? 0), fmt(low), fmt(high)) : props.label;
  const t2 = "0 0 " + W + " " + H;
  const t3 = "none";
  const t4 = "2em";
  const t5 = "0.5em";
  const t6 = "img";
  const t7 = "false";
  const t8 = cn("srp-sparkline", props.className);
  const t9 = "sparkline";
  const t10 = props.area && data.length > 1 ? /* @__PURE__ */ React.createElement("path", { className: "srp-sparkline__area", d: line + "L" + W + " " + H + "L0 " + H + "Z" }) : null;
  const t11 = data.length > 1 ? /* @__PURE__ */ React.createElement("path", { className: "srp-sparkline__line", d: line, vectorEffect: "non-scaling-stroke" }) : null;
  const t12 = data.length ? /* @__PURE__ */ React.createElement("path", { className: "srp-sparkline__dot", d: "M" + x(last) + " " + y(data[last] ?? 0) + "Z", vectorEffect: "non-scaling-stroke" }) : null;
  let t13;
  if ($[3] !== name || $[4] !== ref || $[5] !== rest || $[6] !== t10 || $[7] !== t11 || $[8] !== t12 || $[9] !== t8) {
    t13 = /* @__PURE__ */ React.createElement("svg", { viewBox: t2, preserveAspectRatio: t3, width: t4, height: t5, role: t6, "aria-label": name, focusable: t7, ...rest, ref, className: t8, "data-component": t9 }, t10, t11, t12);
    $[3] = name;
    $[4] = ref;
    $[5] = rest;
    $[6] = t10;
    $[7] = t11;
    $[8] = t12;
    $[9] = t8;
    $[10] = t13;
  } else {
    t13 = $[10];
  }
  return t13;
}
function _temp(v) {
  return typeof v === "number" && isFinite(v);
}
var Sparkline = /* @__PURE__ */ named("Sparkline", SparklineRender);
export {
  Sparkline
};
//# sourceMappingURL=Sparkline.js.map
