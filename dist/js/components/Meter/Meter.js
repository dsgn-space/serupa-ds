"use client";

// src/components/Meter/Meter.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, SIZES } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { named } from "../../internal/component.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { en as words } from "./labels.js";
var OWN = {
  value: 1,
  min: 1,
  max: 1,
  low: 1,
  high: 1,
  optimum: 1,
  size: 1,
  label: 1,
  showValue: 1,
  formatValue: 1,
  className: 1
};
var PERCENT = {
  style: "percent",
  maximumFractionDigits: 0
};
var num = (v) => v != null && isFinite(Number(v)) ? Number(v) : void 0;
function meterState(value, min, max, low, high, optimum) {
  if (low == null && high == null) return "none";
  const lo = Math.min(Math.max(low ?? min, min), max), hi = Math.min(Math.max(high ?? max, lo), max);
  const best = Math.min(Math.max(optimum ?? (min + max) / 2, min), max);
  if (best < lo) return value < lo ? "optimum" : value <= hi ? "suboptimal" : "poor";
  if (best > hi) return value > hi ? "optimum" : value >= lo ? "suboptimal" : "poor";
  return value >= lo && value <= hi ? "optimum" : "suboptimal";
}
function zone(value, min, max, low, high) {
  const lo = Math.min(Math.max(low ?? min, min), max), hi = Math.min(Math.max(high ?? max, lo), max);
  return value < lo ? "low" : value > hi ? "high" : "medium";
}
var TONE = {
  optimum: "success",
  suboptimal: "warning",
  poor: "danger",
  none: null
};
function MeterRender(t0) {
  const $ = _c(29);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Meter", NAME_HOW.label);
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const locale = useLocale();
  const base = domId("srp-mtr", React.useId());
  const size = oneOf(SIZES, props.size, "md");
  const min = num(props.min) ?? 0;
  const max = Math.max(num(props.max) ?? 100, min);
  const value = Math.min(max, Math.max(min, num(props.value) ?? min));
  const share = max > min ? (value - min) / (max - min) : 0;
  const state = meterState(value, min, max, num(props.low), num(props.high), num(props.optimum));
  const tone = TONE[state];
  const labels = useSettings(words).labels;
  const text = props.formatValue ? props.formatValue(value, min, max) : displayNumber(share, locale, PERCENT);
  const spoken = props.formatValue || state === "none" || state === "optimum" ? text : labels.meterZone(text, zone(value, min, max, num(props.low), num(props.high)));
  const hasLabel = props.label != null && props.label !== false && props.label !== "";
  const showValue = !!props.showValue;
  const outer = omit(rest, {
    "aria-label": 1,
    "aria-labelledby": 1
  });
  const t1 = cn("srp-meter", "srp-meter--size-" + size, tone && "srp-meter--" + tone, props.className);
  let t2;
  if ($[0] !== base || $[1] !== hasLabel || $[2] !== props || $[3] !== showValue || $[4] !== spoken) {
    t2 = hasLabel || showValue ? /* @__PURE__ */ React.createElement("div", { className: "srp-meter__header" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-meter__label", id: base + "-label" }, props.label) : null, showValue ? /* @__PURE__ */ React.createElement("span", { className: "srp-meter__value", "aria-hidden": true }, spoken) : null) : null;
    $[0] = base;
    $[1] = hasLabel;
    $[2] = props;
    $[3] = showValue;
    $[4] = spoken;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  const t3 = rest["aria-label"];
  const t4 = rest["aria-labelledby"] || (hasLabel && !rest["aria-label"] ? base + "-label" : void 0);
  const t5 = (1 - share) * 100;
  let t6;
  if ($[6] !== t5) {
    t6 = t5.toFixed(4);
    $[6] = t5;
    $[7] = t6;
  } else {
    t6 = $[7];
  }
  const t7 = +t6 + "%";
  let t8;
  if ($[8] !== t7) {
    t8 = {
      "--srp-meter-rest": t7
    };
    $[8] = t7;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  const t9 = t8;
  let t10;
  if ($[10] !== t9) {
    t10 = /* @__PURE__ */ React.createElement("div", { className: "srp-meter__fill", style: t9 });
    $[10] = t9;
    $[11] = t10;
  } else {
    t10 = $[11];
  }
  let t11;
  if ($[12] !== max || $[13] !== min || $[14] !== nameRef || $[15] !== spoken || $[16] !== t10 || $[17] !== t3 || $[18] !== t4 || $[19] !== value) {
    t11 = /* @__PURE__ */ React.createElement("div", { ref: nameRef, className: "srp-meter__track", role: "meter", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, "aria-valuetext": spoken, "aria-label": t3, "aria-labelledby": t4 }, t10);
    $[12] = max;
    $[13] = min;
    $[14] = nameRef;
    $[15] = spoken;
    $[16] = t10;
    $[17] = t3;
    $[18] = t4;
    $[19] = value;
    $[20] = t11;
  } else {
    t11 = $[20];
  }
  let t12;
  if ($[21] !== outer || $[22] !== restyle || $[23] !== size || $[24] !== state || $[25] !== t1 || $[26] !== t11 || $[27] !== t2) {
    t12 = /* @__PURE__ */ React.createElement("div", { ...outer, ref: restyle, className: t1, "data-component": "meter", "data-size": size, "data-state": state }, t2, t11);
    $[21] = outer;
    $[22] = restyle;
    $[23] = size;
    $[24] = state;
    $[25] = t1;
    $[26] = t11;
    $[27] = t2;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return t12;
}
var Meter = /* @__PURE__ */ named("Meter", MeterRender);
export {
  Meter,
  meterState
};
//# sourceMappingURL=Meter.js.map
