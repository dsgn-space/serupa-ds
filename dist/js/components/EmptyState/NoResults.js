"use client";

// src/components/EmptyState/NoResults.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { buttonClass } from "../Button/buttonClass.js";
import { asIcon } from "../Icon/asIcon.js";
import { useSettings } from "../../internal/provider.js";
import { en as words } from "./labels.js";
function Suggestions(props) {
  const $ = _c(10);
  const labels = useSettings(words).labels;
  let t0;
  if ($[0] !== labels.didYouMean) {
    t0 = /* @__PURE__ */ React.createElement("span", null, labels.didYouMean);
    $[0] = labels.didYouMean;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  let t1;
  if ($[2] !== props.items || $[3] !== props.pick) {
    let t22;
    if ($[5] !== props.pick) {
      t22 = (s) => props.pick ? /* @__PURE__ */ React.createElement("button", { key: s, type: "button", className: buttonClass({
        variant: "link",
        size: "sm",
        className: "srp-empty-state__suggestion"
      }), onClick: () => props.pick(s) }, s) : /* @__PURE__ */ React.createElement("strong", { key: s, className: "srp-empty-state__suggestion" }, s);
      $[5] = props.pick;
      $[6] = t22;
    } else {
      t22 = $[6];
    }
    t1 = props.items.map(t22);
    $[2] = props.items;
    $[3] = props.pick;
    $[4] = t1;
  } else {
    t1 = $[4];
  }
  let t2;
  if ($[7] !== t0 || $[8] !== t1) {
    t2 = /* @__PURE__ */ React.createElement("p", { className: "srp-empty-state__suggestions" }, t0, t1);
    $[7] = t0;
    $[8] = t1;
    $[9] = t2;
  } else {
    t2 = $[9];
  }
  return t2;
}
function ClearFilters(props) {
  const $ = _c(7);
  const labels = useSettings(words).labels;
  const t0 = props.small ? "sm" : "md";
  let t1;
  if ($[0] !== t0) {
    t1 = buttonClass({
      variant: "outline",
      size: t0,
      iconPosition: "start"
    });
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const t2 = props.action;
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = asIcon("filter_alt_off");
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  let t4;
  if ($[3] !== labels.clearFilters || $[4] !== props.action || $[5] !== t1) {
    t4 = /* @__PURE__ */ React.createElement("button", { type: "button", className: t1, onClick: t2 }, t3, labels.clearFilters);
    $[3] = labels.clearFilters;
    $[4] = props.action;
    $[5] = t1;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  return t4;
}
export {
  ClearFilters,
  Suggestions
};
//# sourceMappingURL=NoResults.js.map
