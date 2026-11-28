"use client";

// src/components/Watermark/Watermark.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
var GAP = {
  md: 3,
  lg: 6
};
var EM = 100;
var LINE = 1.4;
var WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1f000}-\u{1faff}\u{20000}-\u{3fffd}]/u;
var width = (line) => [...line].reduce((sum, ch) => sum + (WIDE.test(ch) ? 1 : 0.62), 0);
var escape = (s) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
var round = (n) => Math.round(n * 100) / 100;
function tile(lines, gap, rotate) {
  const w = Math.max(1, ...lines.map(width));
  const h = lines.length * LINE;
  const rad = rotate * Math.PI / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const tw = round(w * cos + h * sin + gap);
  const th = round(w * sin + h * cos + gap);
  const first = round(-(lines.length - 1) * LINE * EM / 2);
  const spans = lines.map((l, i) => `<tspan x="0" ${i ? `dy="${LINE * EM}"` : `y="${first}"`}>${escape(l)}</tspan>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(-tw * EM / 2)} ${round(-th * EM / 2)} ${round(tw * EM)} ${round(th * EM)}"><text transform="rotate(${rotate})" font-family="system-ui,sans-serif" font-weight="600" font-size="${EM}" text-anchor="middle" dominant-baseline="central">${spans}</text></svg>`;
  return {
    w: tw,
    h: th,
    url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  };
}
function WatermarkRender(t0) {
  const $ = _c(28);
  let children;
  let className;
  let fullPage;
  let gap;
  let ref;
  let rest;
  let rotate;
  let text;
  if ($[0] !== t0) {
    ({
      ref,
      className,
      text,
      gap,
      rotate,
      fullPage,
      children,
      ...rest
    } = t0);
    $[0] = t0;
    $[1] = children;
    $[2] = className;
    $[3] = fullPage;
    $[4] = gap;
    $[5] = ref;
    $[6] = rest;
    $[7] = rotate;
    $[8] = text;
  } else {
    children = $[1];
    className = $[2];
    fullPage = $[3];
    gap = $[4];
    ref = $[5];
    rest = $[6];
    rotate = $[7];
    text = $[8];
  }
  let lines;
  let t1;
  if ($[9] !== gap || $[10] !== rotate || $[11] !== text) {
    lines = (typeof text === "string" ? [text] : [...text]).map(_temp).filter(Boolean);
    let t22;
    if ($[14] !== rotate) {
      t22 = rotate != null && Number.isFinite(rotate) ? rotate : -22;
      $[14] = rotate;
      $[15] = t22;
    } else {
      t22 = $[15];
    }
    const angle = Math.max(-90, Math.min(90, t22));
    t1 = tile(lines, GAP[gap ?? "md"] ?? GAP.md, angle);
    $[9] = gap;
    $[10] = rotate;
    $[11] = text;
    $[12] = lines;
    $[13] = t1;
  } else {
    lines = $[12];
    t1 = $[13];
  }
  const mark = t1;
  const t2 = fullPage && "srp-watermark--full-page";
  let t3;
  if ($[16] !== className || $[17] !== t2) {
    t3 = cn("srp-watermark", t2, className);
    $[16] = className;
    $[17] = t2;
    $[18] = t3;
  } else {
    t3 = $[18];
  }
  let t4;
  if ($[19] !== lines.length || $[20] !== mark) {
    t4 = lines.length > 0 && /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", className: "srp-watermark__mark", style: {
      "--srp-watermark-image": mark.url,
      "--srp-watermark-w": mark.w,
      "--srp-watermark-h": mark.h
    } });
    $[19] = lines.length;
    $[20] = mark;
    $[21] = t4;
  } else {
    t4 = $[21];
  }
  let t5;
  if ($[22] !== children || $[23] !== ref || $[24] !== rest || $[25] !== t3 || $[26] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t3, "data-component": "watermark" }, children, t4);
    $[22] = children;
    $[23] = ref;
    $[24] = rest;
    $[25] = t3;
    $[26] = t4;
    $[27] = t5;
  } else {
    t5 = $[27];
  }
  return t5;
}
function _temp(l) {
  return l.trim();
}
var Watermark = /* @__PURE__ */ named("Watermark", WatermarkRender);
export {
  Watermark,
  tile
};
//# sourceMappingURL=Watermark.js.map
