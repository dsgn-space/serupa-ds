"use client";

// src/components/Quote/Quote.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, omit } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var OWN = {
  children: 1,
  author: 1,
  source: 1,
  avatar: 1,
  cite: 1,
  size: 1,
  className: 1
};
function QuoteRender(t0) {
  const $ = _c(28);
  let author;
  let avatar;
  let by;
  let children;
  let cite;
  let from;
  let source;
  let t1;
  let t2;
  let t3;
  if ($[0] !== t0) {
    const {
      ref,
      ...props
    } = t0;
    const {
      children: t42,
      author: t52,
      source: t62,
      avatar: t72,
      cite: t8,
      size,
      className
    } = props;
    children = t42;
    author = t52;
    source = t62;
    avatar = t72;
    cite = t8;
    by = author != null && author !== false && author !== "";
    from = source != null && source !== false && source !== "";
    t1 = omit(props, OWN);
    t2 = ref;
    t3 = cn("srp-quote", size === "lg" && "srp-quote--lg", className);
    $[0] = t0;
    $[1] = author;
    $[2] = avatar;
    $[3] = by;
    $[4] = children;
    $[5] = cite;
    $[6] = from;
    $[7] = source;
    $[8] = t1;
    $[9] = t2;
    $[10] = t3;
  } else {
    author = $[1];
    avatar = $[2];
    by = $[3];
    children = $[4];
    cite = $[5];
    from = $[6];
    source = $[7];
    t1 = $[8];
    t2 = $[9];
    t3 = $[10];
  }
  let t4;
  if ($[11] !== children) {
    t4 = typeof children === "string" ? /* @__PURE__ */ React.createElement("p", null, children) : children;
    $[11] = children;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  let t5;
  if ($[13] !== cite || $[14] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("blockquote", { className: "srp-quote__text", cite }, t4);
    $[13] = cite;
    $[14] = t4;
    $[15] = t5;
  } else {
    t5 = $[15];
  }
  let t6;
  if ($[16] !== author || $[17] !== avatar || $[18] !== by || $[19] !== from || $[20] !== source) {
    t6 = by || from ? /* @__PURE__ */ React.createElement("figcaption", { className: "srp-quote__by" }, avatar, /* @__PURE__ */ React.createElement("span", { className: "srp-quote__who" }, by ? /* @__PURE__ */ React.createElement("span", { className: "srp-quote__author" }, author) : null, from ? /* @__PURE__ */ React.createElement("span", { className: "srp-quote__source" }, source) : null)) : null;
    $[16] = author;
    $[17] = avatar;
    $[18] = by;
    $[19] = from;
    $[20] = source;
    $[21] = t6;
  } else {
    t6 = $[21];
  }
  let t7;
  if ($[22] !== t1 || $[23] !== t2 || $[24] !== t3 || $[25] !== t5 || $[26] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("figure", { ...t1, ref: t2, className: t3, "data-component": "quote" }, t5, t6);
    $[22] = t1;
    $[23] = t2;
    $[24] = t3;
    $[25] = t5;
    $[26] = t6;
    $[27] = t7;
  } else {
    t7 = $[27];
  }
  return t7;
}
var Quote = /* @__PURE__ */ named("Quote", QuoteRender);
export {
  Quote
};
//# sourceMappingURL=Quote.js.map
