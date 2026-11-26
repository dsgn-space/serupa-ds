"use client";

// src/components/Loader/Loader.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, SIZES } from "../../internal/cn.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useShowAfter } from "../../internal/showAfter.js";
import { RingArt } from "../../internal/loaderRing.js";
import { spinnerDelay } from "../../internal/timing.js";
var VARIANTS = ["ring", "dots", "text"];
var TONES = ["neutral", "primary", "muted", "inverse"];
var OWN = {
  variant: 1,
  size: 1,
  tone: 1,
  label: 1,
  delay: 1,
  loading: 1,
  className: 1,
  shape: 1,
  lines: 1,
  pattern: 1,
  glow: 1
};
function LoaderRender(t0) {
  const $ = _c(18);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const rest = omit(props, OWN);
  const variant = oneOf(VARIANTS, props.variant, "ring");
  const size = oneOf(SIZES, props.size, "md");
  const tone = oneOf(TONES, props.tone, "neutral");
  const label = props.label == null ? sds.labels.loading : String(props.label);
  const isText = variant === "text";
  const words = label || sds.labels.loading;
  const delay = props.delay == null ? spinnerDelay : Math.max(0, Number(props.delay) || 0);
  const [wait] = React.useState(delay);
  const loading = props.loading !== false;
  const shown = useShowAfter(loading, wait);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(_temp, t1);
  const latestLabel = React.useRef(label);
  let t2;
  if ($[1] !== label) {
    t2 = function() {
      latestLabel.current = label;
    };
    $[1] = label;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  React.useEffect(t2);
  let t3;
  let t4;
  if ($[3] !== shown) {
    t3 = function() {
      if (shown && latestLabel.current) {
        announce(latestLabel.current);
      }
    };
    t4 = [shown];
    $[3] = shown;
    $[4] = t3;
    $[5] = t4;
  } else {
    t3 = $[4];
    t4 = $[5];
  }
  React.useEffect(t3, t4);
  rest["data-component"] = "loader";
  rest["data-variant"] = variant;
  rest["data-size"] = size;
  if (shown && label) {
    rest.role = "progressbar";
    rest["aria-label"] = label;
  } else {
    rest["aria-hidden"] = true;
  }
  const drawing = !shown || isText ? null : variant === "dots" ? /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 4, cy: 12, r: 2.5 }), /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 12, cy: 12, r: 2.5 }), /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 20, cy: 12, r: 2.5 })) : /* @__PURE__ */ React.createElement(RingArt, null);
  let t5;
  if ($[6] !== isText || $[7] !== words) {
    t5 = isText ? /* @__PURE__ */ React.createElement("span", { className: "srp-loader__label", "aria-hidden": true, key: "label" }, words, /* @__PURE__ */ React.createElement("span", { className: "srp-loader__glint", "data-words": words })) : null;
    $[6] = isText;
    $[7] = words;
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  const text = t5;
  const cls = cn("srp-loader", "srp-loader--" + variant, "srp-loader--size-" + size, tone !== "neutral" && "srp-loader--" + tone, !shown && "srp-loader--waiting", props.className);
  if (!loading && !shown) {
    return null;
  }
  let t6;
  if ($[9] !== drawing || $[10] !== isText) {
    t6 = isText ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-loader__art", key: "art" }, drawing);
    $[9] = drawing;
    $[10] = isText;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== cls || $[13] !== ref || $[14] !== rest || $[15] !== t6 || $[16] !== text) {
    t7 = /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cls }, t6, text);
    $[12] = cls;
    $[13] = ref;
    $[14] = rest;
    $[15] = t6;
    $[16] = text;
    $[17] = t7;
  } else {
    t7 = $[17];
  }
  return t7;
}
function _temp() {
  ensureAnnouncer();
}
var Loader = /* @__PURE__ */ named("Loader", LoaderRender);
export {
  Loader
};
//# sourceMappingURL=Loader.js.map
