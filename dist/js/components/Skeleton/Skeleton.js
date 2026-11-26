"use client";

// src/components/Skeleton/Skeleton.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf, omit, SIZES } from "../../internal/cn.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { useShowAfter } from "../../internal/showAfter.js";
import { spinnerDelay } from "../../internal/timing.js";
var SHAPES = ["text", "circle", "rect"];
var TONES = ["neutral", "inverse"];
var OWN = {
  shape: 1,
  lines: 1,
  size: 1,
  tone: 1,
  label: 1,
  delay: 1,
  loading: 1,
  className: 1
};
function SkeletonRender(t0) {
  const $ = _c(7);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings();
  const rest = omit(props, OWN);
  const shape = oneOf(SHAPES, props.shape, "text");
  const size = oneOf(SIZES, props.size, "md");
  const tone = oneOf(TONES, props.tone, "neutral");
  const label = props.label == null ? sds.labels.loading : String(props.label);
  const lines = Math.min(20, Math.max(1, Math.floor(Number(props.lines)) || 1));
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
  if (!loading && !shown) {
    return null;
  }
  rest["data-component"] = "skeleton";
  rest["data-shape"] = shape;
  rest["data-size"] = size;
  if (shown && label) {
    rest.role = "progressbar";
    rest["aria-label"] = label;
  } else {
    rest["aria-hidden"] = true;
  }
  const bones = [];
  if (shape === "text") {
    for (let i = 0; i < lines; i++) {
      bones.push(/* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__line", key: i }, /* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__bone" })));
    }
  } else {
    let t5;
    if ($[6] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
      t5 = /* @__PURE__ */ React.createElement("span", { className: "srp-skeleton__bone", key: "bone" });
      $[6] = t5;
    } else {
      t5 = $[6];
    }
    bones.push(t5);
  }
  return /* @__PURE__ */ React.createElement("span", { ...rest, ref, className: cn("srp-skeleton", "srp-skeleton--" + shape, "srp-skeleton--size-" + size, tone === "inverse" && "srp-skeleton--inverse", !shown && "srp-skeleton--waiting", props.className) }, bones);
}
function _temp() {
  ensureAnnouncer();
}
var Skeleton = /* @__PURE__ */ named("Skeleton", SkeletonRender);
export {
  Skeleton
};
//# sourceMappingURL=Skeleton.js.map
