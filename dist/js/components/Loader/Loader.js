"use client";

// src/components/Loader/Loader.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, SIZES } from "../../internal/cn.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useShowAfter } from "../../internal/showAfter.js";
import { RingArt } from "../../internal/loaderRing.js";
import { spinnerDelay } from "../../internal/timing.js";
var VARIANTS = ["ring", "spokes", "dots", "pixel", "text", "skeleton"];
var SHAPES = ["text", "circle", "rect"];
var TONES = ["neutral", "primary", "muted", "inverse"];
var PATTERNS = ["wave", "random", "sweep", "fall", "rise", "snake", "spiral", "cross", "checker"];
var PIXEL_STEPS = {
  sweep: [0, 2, 4, 0, 2, 4, 0, 2, 4],
  // columns, left to right
  fall: [0, 0, 0, 2, 2, 2, 4, 4, 4],
  // rows, top to bottom
  rise: [4, 4, 4, 2, 2, 2, 0, 0, 0],
  // rows, bottom to top
  snake: [0, 1, 2, 5, 4, 3, 6, 7, 8],
  // left to right, then back, row by row
  spiral: [0, 1, 2, 7, 8, 3, 6, 5, 4],
  // clockwise round the edge from the top-left, then the center
  cross: [0, 7, 0, 7, 7, 7, 0, 7, 0],
  // the corners, then the plus (edges and center)
  checker: [0, 7, 0, 7, 0, 7, 0, 7, 0]
  // the X (corners and center), then the edges
};
var OWN = {
  variant: 1,
  size: 1,
  tone: 1,
  label: 1,
  delay: 1,
  loading: 1,
  shape: 1,
  lines: 1,
  pattern: 1,
  glow: 1,
  className: 1
};
function LoaderRender(t0) {
  const $ = _c(27);
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
  const isSkeleton = variant === "skeleton";
  const shape = oneOf(SHAPES, props.shape, "text");
  const pattern = oneOf(PATTERNS, props.pattern, "wave");
  const lines = Math.min(20, Math.max(1, Math.floor(Number(props.lines)) || 1));
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
  if (isSkeleton) {
    rest["data-shape"] = shape;
  }
  if (variant === "pixel") {
    rest["data-pattern"] = pattern;
  }
  if (shown && label) {
    rest.role = "progressbar";
    rest["aria-label"] = label;
  } else {
    rest["aria-hidden"] = true;
  }
  const maskId = domId("srp-px", React.useId());
  const cells = [];
  if (variant === "pixel") {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push(/* @__PURE__ */ React.createElement("rect", { key: r * 3 + c, className: "srp-loader__px " + (pattern === "wave" ? "srp-loader__px--d" + (r + c) : pattern === "random" ? "srp-loader__px--r" + (r * 3 + c) : "srp-loader__px--s" + PIXEL_STEPS[pattern]?.[r * 3 + c]), x: c * 8, y: r * 8, width: 8, height: 8 }));
      }
    }
  }
  const drawing = !shown || isText ? null : variant === "pixel" ? /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("mask", { id: maskId, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 24, height: 24 }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white" }), /* @__PURE__ */ React.createElement("path", { className: "srp-loader__px-cut", d: "M16 0V48M32 0V48M0 16H48M0 32H48", transform: "scale(0.5)" })), /* @__PURE__ */ React.createElement("g", { mask: "url(#" + maskId + ")" }, cells), /* @__PURE__ */ React.createElement("path", { className: "srp-loader__px-divider", d: "M16 0V48M32 0V48M0 16H48M0 32H48", transform: "scale(0.5)" })) : variant === "spokes" ? /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("g", { transform: "scale(0.625)" }, [0, 1, 2, 3, 4, 5, 6, 7].map(_temp2))) : variant === "dots" ? /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 4, cy: 12, r: 2.5 }), /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 12, cy: 12, r: 2.5 }), /* @__PURE__ */ React.createElement("circle", { className: "srp-loader__dot", cx: 20, cy: 12, r: 2.5 })) : /* @__PURE__ */ React.createElement(RingArt, null);
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
  const cls = cn("srp-loader", "srp-loader--" + variant, isSkeleton && "srp-loader--shape-" + shape, variant === "pixel" && pattern !== "wave" && "srp-loader--pattern-" + pattern, variant === "pixel" && props.glow && "srp-loader--glow", "srp-loader--size-" + size, tone !== "neutral" && "srp-loader--" + tone, !shown && "srp-loader--waiting", props.className);
  if (!loading && !shown) {
    return null;
  }
  if (isSkeleton) {
    let bones;
    if ($[9] !== lines || $[10] !== shape) {
      bones = [];
      if (shape === "text") {
        for (let i = 0; i < lines; i++) {
          bones.push(/* @__PURE__ */ React.createElement("span", { className: "srp-loader__line", key: i }, /* @__PURE__ */ React.createElement("span", { className: "srp-loader__bone" })));
        }
      } else {
        let t63;
        if ($[12] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
          t63 = /* @__PURE__ */ React.createElement("span", { className: "srp-loader__bone", key: "bone" });
          $[12] = t63;
        } else {
          t63 = $[12];
        }
        bones.push(t63);
      }
      $[9] = lines;
      $[10] = shape;
      $[11] = bones;
    } else {
      bones = $[11];
    }
    let t62;
    if ($[13] !== bones || $[14] !== cls || $[15] !== ref || $[16] !== rest) {
      t62 = /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cls }, bones);
      $[13] = bones;
      $[14] = cls;
      $[15] = ref;
      $[16] = rest;
      $[17] = t62;
    } else {
      t62 = $[17];
    }
    return t62;
  }
  let t6;
  if ($[18] !== drawing || $[19] !== isText) {
    t6 = isText ? null : /* @__PURE__ */ React.createElement("span", { className: "srp-loader__art", key: "art" }, drawing);
    $[18] = drawing;
    $[19] = isText;
    $[20] = t6;
  } else {
    t6 = $[20];
  }
  let t7;
  if ($[21] !== cls || $[22] !== ref || $[23] !== rest || $[24] !== t6 || $[25] !== text) {
    t7 = /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cls }, t6, text);
    $[21] = cls;
    $[22] = ref;
    $[23] = rest;
    $[24] = t6;
    $[25] = text;
    $[26] = t7;
  } else {
    t7 = $[26];
  }
  return t7;
}
function _temp2(k) {
  return /* @__PURE__ */ React.createElement("line", { key: k, className: "srp-loader__spoke", x1: 19.2, y1: 4, x2: 19.2, y2: 9.6, transform: "rotate(" + -45 * k + " 19.2 19.2)" });
}
function _temp() {
  ensureAnnouncer();
}
var Loader = /* @__PURE__ */ named("Loader", LoaderRender);
export {
  Loader
};
//# sourceMappingURL=Loader.js.map
