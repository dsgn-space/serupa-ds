"use client";

// src/components/Progress/Progress.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, SIZES, useLatest } from "../../internal/cn.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { named } from "../../internal/component.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { announce, ensureAnnouncer } from "../../internal/announce.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { en as ownWords } from "./labels.js";
var TONES = ["primary", "success", "warning", "danger"];
var OWN = {
  value: 1,
  max: 1,
  variant: 1,
  size: 1,
  tone: 1,
  label: 1,
  showValue: 1,
  formatValue: 1,
  announceComplete: 1,
  onComplete: 1,
  className: 1
};
var PERCENT = {
  style: "percent",
  maximumFractionDigits: 0
};
var RING_GAP = 4.5;
function ProgressRender(t0) {
  const $ = _c(29);
  const {
    ref,
    ...props
  } = t0;
  const nameRef = useNameCheck("Progress", NAME_HOW.label);
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const locale = useLocale();
  const base = domId("srp-prg", React.useId());
  const variant = props.variant === "circle" ? "circle" : "bar";
  const size = oneOf(SIZES, props.size, "md");
  const tone = oneOf(TONES, props.tone, "primary");
  const max = Number(props.max) > 0 && Number.isFinite(Number(props.max)) ? Number(props.max) : 100;
  const known = props.value != null && isFinite(Number(props.value));
  const value = known ? Math.min(max, Math.max(0, Number(props.value))) : 0;
  const text = known ? props.formatValue ? props.formatValue(value, max) : displayNumber(value / max, locale, PERCENT) : "";
  const hasLabel = props.label != null && props.label !== false && props.label !== "";
  const showValue = !!props.showValue && known;
  const share = known ? value / max : 0;
  const sds = useSettings(ownWords);
  const done = known && value >= max;
  const was = React.useRef(done);
  const name = typeof props.label === "string" ? props.label : typeof rest["aria-label"] === "string" ? rest["aria-label"] : "";
  const words = props.announceComplete ? typeof props.announceComplete === "string" ? props.announceComplete : sds.labels.progressComplete(name) : "";
  const finish = useLatest({
    words,
    onComplete: props.onComplete
  });
  const speaks = !!props.announceComplete;
  let t1;
  let t2;
  if ($[0] !== speaks) {
    t1 = () => {
      if (speaks) {
        ensureAnnouncer();
      }
    };
    t2 = [speaks];
    $[0] = speaks;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  React.useEffect(t1, t2);
  let t3;
  let t4;
  if ($[3] !== done || $[4] !== finish) {
    t3 = () => {
      if (done && !was.current) {
        if (finish.current.words) {
          announce(finish.current.words);
        }
        if (finish.current.onComplete) {
          finish.current.onComplete();
        }
      }
      was.current = done;
    };
    t4 = [done, finish];
    $[3] = done;
    $[4] = finish;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  React.useEffect(t3, t4);
  const aria = {
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": max
  };
  if (known) {
    aria["aria-valuenow"] = value;
    aria["aria-valuetext"] = text;
  }
  const nameless = hasLabel && !rest["aria-label"] && !rest["aria-labelledby"];
  const said = typeof props.label === "string" || typeof props.label === "number" ? String(props.label) : null;
  const ringText = nameless && variant === "circle" && said != null;
  if (ringText) {
    aria["aria-label"] = said;
  } else {
    if (nameless) {
      aria["aria-labelledby"] = base + "-label";
    }
  }
  const cls = cn("srp-progress", "srp-progress--" + variant, "srp-progress--size-" + size, tone !== "primary" && "srp-progress--" + tone, !known && "srp-progress--indeterminate", props.className);
  const data = {
    "data-component": "progress",
    "data-variant": variant,
    "data-size": size,
    "data-tone": tone,
    "data-state": known ? value >= max ? "complete" : "loading" : "indeterminate"
  };
  if (variant === "circle") {
    const done_0 = known ? share * 100 : 25;
    let t52;
    if ($[7] !== nameRef || $[8] !== restyle) {
      t52 = (n) => {
        restyle(n);
        nameRef(n);
      };
      $[7] = nameRef;
      $[8] = restyle;
      $[9] = t52;
    } else {
      t52 = $[9];
    }
    const t62 = Math.max(0, 100 - done_0 - 2 * RING_GAP) + " 100";
    const t72 = -(done_0 + RING_GAP);
    let t8;
    if ($[10] !== t62 || $[11] !== t72) {
      t8 = /* @__PURE__ */ React.createElement("circle", { className: "srp-progress__track", cx: 12, cy: 12, r: 10.5, pathLength: 100, strokeDasharray: t62, strokeDashoffset: t72 });
      $[10] = t62;
      $[11] = t72;
      $[12] = t8;
    } else {
      t8 = $[12];
    }
    const t9 = done_0 + " 100";
    let t10;
    if ($[13] !== t9) {
      t10 = /* @__PURE__ */ React.createElement("circle", { className: "srp-progress__arc", cx: 12, cy: 12, r: 10.5, pathLength: 100, strokeDasharray: t9 });
      $[13] = t9;
      $[14] = t10;
    } else {
      t10 = $[14];
    }
    let t11;
    if ($[15] !== t10 || $[16] !== t8) {
      t11 = /* @__PURE__ */ React.createElement("svg", { className: "srp-progress__ring", width: "1em", height: "1em", viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false" }, t8, t10);
      $[15] = t10;
      $[16] = t8;
      $[17] = t11;
    } else {
      t11 = $[17];
    }
    return /* @__PURE__ */ React.createElement("div", { ...rest, ...aria, ...data, ref: t52, className: cls }, t11, showValue && size !== "sm" ? /* @__PURE__ */ React.createElement("span", { className: "srp-progress__value", "aria-hidden": true }, text) : null, nameless && !ringText ? /* @__PURE__ */ React.createElement("span", { id: base + "-label", hidden: true }, props.label) : null);
  }
  const outer = omit(rest, {
    "aria-label": 1,
    "aria-labelledby": 1
  });
  let t5;
  if ($[18] !== base || $[19] !== hasLabel || $[20] !== props || $[21] !== showValue || $[22] !== text) {
    t5 = hasLabel || showValue ? /* @__PURE__ */ React.createElement("div", { className: "srp-progress__header" }, hasLabel ? /* @__PURE__ */ React.createElement("span", { className: "srp-progress__label", id: base + "-label" }, props.label) : null, showValue ? /* @__PURE__ */ React.createElement("span", { className: "srp-progress__value", "aria-hidden": true }, text) : null) : null;
    $[18] = base;
    $[19] = hasLabel;
    $[20] = props;
    $[21] = showValue;
    $[22] = text;
    $[23] = t5;
  } else {
    t5 = $[23];
  }
  let t6;
  if ($[24] !== known || $[25] !== share) {
    t6 = known ? {
      "--srp-progress-rest": +((1 - share) * 100).toFixed(4) + "%"
    } : void 0;
    $[24] = known;
    $[25] = share;
    $[26] = t6;
  } else {
    t6 = $[26];
  }
  let t7;
  if ($[27] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("div", { className: "srp-progress__fill", style: t6 });
    $[27] = t6;
    $[28] = t7;
  } else {
    t7 = $[28];
  }
  return /* @__PURE__ */ React.createElement("div", { ...outer, ...data, ref: restyle, className: cls }, t5, /* @__PURE__ */ React.createElement("div", { ...aria, ref: nameRef, className: "srp-progress__track", "aria-label": rest["aria-label"], "aria-labelledby": rest["aria-labelledby"] || aria["aria-labelledby"] }, t7));
}
var Progress = /* @__PURE__ */ named("Progress", ProgressRender);
export {
  Progress
};
//# sourceMappingURL=Progress.js.map
