"use client";

// src/components/StatTile/StatTile.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { useSettings } from "../../internal/provider.js";
import { Badge } from "../Badge/Badge.js";
import { Sparkline } from "../Sparkline/Sparkline.js";
import { Skeleton } from "../Skeleton/Skeleton.js";
import { en as words } from "./labels.js";
var ARROW = {
  up: "arrow_upward",
  down: "arrow_downward",
  flat: "remove"
};
var OWN = {
  label: 1,
  value: 1,
  change: 1,
  period: 1,
  trend: 1,
  trendLabel: 1,
  trendFormat: 1,
  loading: 1,
  loadingLabel: 1,
  as: 1,
  className: 1
};
function StatTileRender(t0) {
  const $ = _c(7);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, OWN);
  const sds = useSettings(words);
  const c = props.change;
  const direction = c && (c.direction === "up" || c.direction === "down") ? c.direction : "flat";
  const good = c ? c.good ?? direction === "up" : false;
  const tone = direction === "flat" ? "neutral" : good ? "success" : "danger";
  const Tag = props.as === "li" || props.as === "article" ? props.as : "div";
  const trend = props.trend && props.trend.length > 1 ? props.trend : null;
  const t1 = ref;
  const t2 = props.loading || void 0;
  const t3 = cn("srp-stat-tile", props.className);
  const t4 = "stat-tile";
  const t5 = props.loading ? /* @__PURE__ */ React.createElement(Skeleton, { shape: "text", lines: 3, label: props.loadingLabel }) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "srp-stat-tile__label" }, props.label), /* @__PURE__ */ React.createElement("p", { className: "srp-stat-tile__value" }, props.value), c ? /* @__PURE__ */ React.createElement("p", { className: "srp-stat-tile__change" }, /* @__PURE__ */ React.createElement(Badge, { tone, startIcon: ARROW[direction] }, direction === "up" ? sds.labels.statTileUp(c.amount) : direction === "down" ? sds.labels.statTileDown(c.amount) : sds.labels.statTileFlat), props.period ? /* @__PURE__ */ React.createElement("span", null, props.period) : null) : null, trend ? /* @__PURE__ */ React.createElement(Sparkline, { className: "srp-stat-tile__trend", data: trend, format: props.trendFormat, label: props.trendLabel ?? sds.labels.statTileTrend(props.label, trend.length) }) : null);
  let t6;
  if ($[0] !== Tag || $[1] !== rest || $[2] !== t1 || $[3] !== t2 || $[4] !== t3 || $[5] !== t5) {
    t6 = /* @__PURE__ */ React.createElement(Tag, { ...rest, ref: t1, "aria-busy": t2, className: t3, "data-component": t4 }, t5);
    $[0] = Tag;
    $[1] = rest;
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
    $[5] = t5;
    $[6] = t6;
  } else {
    t6 = $[6];
  }
  return t6;
}
var StatTile = /* @__PURE__ */ named("StatTile", StatTileRender);
export {
  StatTile
};
//# sourceMappingURL=StatTile.js.map
