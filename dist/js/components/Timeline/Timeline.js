"use client";

// src/components/Timeline/Timeline.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, oneOf } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { asIcon } from "../Icon/asIcon.js";
import { useSettings } from "../../internal/provider.js";
import { useScrolls } from "../../internal/useScrolls.js";
import { en as words } from "./labels.js";
var ALIGNS = ["start", "alternate"];
var ORIENTATIONS = ["vertical", "horizontal"];
var TONES = ["neutral", "primary", "success", "warning", "danger", "info"];
function TimelineRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const {
    className,
    align,
    orientation,
    stackWhenNarrow,
    style,
    ...rest
  } = props;
  const a = oneOf(ALIGNS, align, "start");
  const horizontal = oneOf(ORIENTATIONS, orientation, "vertical") === "horizontal";
  const L = useSettings(words).labels;
  const [box, setBox] = React.useState(null);
  const scrolls = useScrolls(horizontal ? box : null);
  if (!horizontal) {
    return /* @__PURE__ */ React.createElement("ol", { role: "list", ...rest, style, ref, className: cn("srp-timeline", a === "alternate" && "srp-timeline--alternate", className), "data-component": "timeline" });
  }
  const {
    "aria-label": label,
    "aria-labelledby": labelledBy,
    ...list
  } = rest;
  const region = scrolls ? {
    tabIndex: 0,
    role: "region",
    "aria-labelledby": labelledBy,
    "aria-label": labelledBy ? void 0 : label || L.timeline
  } : {};
  const t1 = cn("srp-timeline-scroll", stackWhenNarrow && "srp-timeline-scroll--stack", className);
  const t2 = scrolls ? void 0 : label;
  const t3 = scrolls ? void 0 : labelledBy;
  let t4;
  if ($[0] !== list || $[1] !== ref || $[2] !== t2 || $[3] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("ol", { role: "list", ...list, "aria-label": t2, "aria-labelledby": t3, ref, className: "srp-timeline srp-timeline--horizontal" });
    $[0] = list;
    $[1] = ref;
    $[2] = t2;
    $[3] = t3;
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== region || $[6] !== setBox || $[7] !== style || $[8] !== t1 || $[9] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("div", { ref: setBox, className: t1, style, ...region, "data-component": "timeline", "data-orientation": "horizontal" }, t4);
    $[5] = region;
    $[6] = setBox;
    $[7] = style;
    $[8] = t1;
    $[9] = t4;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}
var Timeline = /* @__PURE__ */ named("Timeline", TimelineRender);
function TimelineItemRender(t0) {
  const $ = _c(38);
  let children;
  let dateTime;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let t7;
  let time;
  let title;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      className,
      title: t82,
      time: t92,
      dateTime: t102,
      icon,
      tone,
      children: t112,
      ...rest
    } = props;
    title = t82;
    time = t92;
    dateTime = t102;
    children = t112;
    const s = oneOf(TONES, tone, "neutral");
    t5 = rest;
    t6 = ref;
    t7 = cn("srp-timeline__item", "srp-timeline__item--" + s, className);
    t3 = "srp-timeline__rail";
    t4 = "true";
    const t122 = icon != null && "srp-timeline__marker--icon";
    if ($[12] !== t122) {
      t1 = cn("srp-timeline__marker", t122);
      $[12] = t122;
      $[13] = t1;
    } else {
      t1 = $[13];
    }
    t2 = icon != null ? asIcon(icon) : null;
    $[0] = t0;
    $[1] = children;
    $[2] = dateTime;
    $[3] = t1;
    $[4] = t2;
    $[5] = t3;
    $[6] = t4;
    $[7] = t5;
    $[8] = t6;
    $[9] = t7;
    $[10] = time;
    $[11] = title;
  } else {
    children = $[1];
    dateTime = $[2];
    t1 = $[3];
    t2 = $[4];
    t3 = $[5];
    t4 = $[6];
    t5 = $[7];
    t6 = $[8];
    t7 = $[9];
    time = $[10];
    title = $[11];
  }
  let t8;
  if ($[14] !== t1 || $[15] !== t2) {
    t8 = /* @__PURE__ */ React.createElement("span", { className: t1 }, t2);
    $[14] = t1;
    $[15] = t2;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== t3 || $[18] !== t4 || $[19] !== t8) {
    t9 = /* @__PURE__ */ React.createElement("span", { className: t3, "aria-hidden": t4 }, t8);
    $[17] = t3;
    $[18] = t4;
    $[19] = t8;
    $[20] = t9;
  } else {
    t9 = $[20];
  }
  let t10;
  if ($[21] !== title) {
    t10 = title != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-timeline__title" }, title) : null;
    $[21] = title;
    $[22] = t10;
  } else {
    t10 = $[22];
  }
  let t11;
  if ($[23] !== dateTime || $[24] !== time) {
    t11 = time != null ? dateTime ? /* @__PURE__ */ React.createElement("time", { className: "srp-timeline__time", dateTime }, time) : /* @__PURE__ */ React.createElement("span", { className: "srp-timeline__time" }, time) : null;
    $[23] = dateTime;
    $[24] = time;
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== children) {
    t12 = children != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-timeline__content" }, children) : null;
    $[26] = children;
    $[27] = t12;
  } else {
    t12 = $[27];
  }
  let t13;
  if ($[28] !== t10 || $[29] !== t11 || $[30] !== t12) {
    t13 = /* @__PURE__ */ React.createElement("div", { className: "srp-timeline__body" }, t10, t11, t12);
    $[28] = t10;
    $[29] = t11;
    $[30] = t12;
    $[31] = t13;
  } else {
    t13 = $[31];
  }
  let t14;
  if ($[32] !== t13 || $[33] !== t5 || $[34] !== t6 || $[35] !== t7 || $[36] !== t9) {
    t14 = /* @__PURE__ */ React.createElement("li", { ...t5, ref: t6, className: t7 }, t9, t13);
    $[32] = t13;
    $[33] = t5;
    $[34] = t6;
    $[35] = t7;
    $[36] = t9;
    $[37] = t14;
  } else {
    t14 = $[37];
  }
  return t14;
}
var TimelineItem = /* @__PURE__ */ named("TimelineItem", TimelineItemRender);
export {
  Timeline,
  TimelineItem
};
//# sourceMappingURL=Timeline.js.map
