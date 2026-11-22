"use client";

// src/components/Chart/Chart.tsx
import { c as _c } from "../../internal/memoCache.js";
import * as React from "react";
import { cn, domId, oneOf, omit, useIsoLayoutEffect, useLatest } from "../../internal/cn.js";
import { named } from "../../internal/component.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { isComposing } from "../../internal/ime.js";
import { SkeletonArt, useSkeletonShown } from "../../internal/loaderSkeleton.js";
import { useServerStyles } from "../../internal/serverStyles.js";
import { Button } from "../Button/Button.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../Table/Table.js";
import { en as words } from "./labels.js";
var OWN = {
  type: 1,
  scale: 1,
  midpoint: 1,
  stacked: 1,
  title: 1,
  categories: 1,
  series: 1,
  formatValue: 1,
  categoryLabel: 1,
  height: 1,
  hideLegend: 1,
  view: 1,
  defaultView: 1,
  onViewChange: 1,
  loading: 1,
  loadingLabel: 1,
  className: 1
};
var TYPES = ["line", "bar", "area", "donut", "heatmap"];
var SCALES = ["sequential", "diverging"];
var ROWS = 64;
var ROW = 32;
var VIEWS = ["chart", "table"];
var COLORS = 8;
var CHAR = 7.2;
var PAD_TOP = 8;
var PAD_END = 8;
var AXIS = 24;
var INSET = 10;
var MARKER = 4;
var WIDTH = 640;
function ChartPlaceholder(t0) {
  const $ = _c(8);
  const {
    height,
    label
  } = t0;
  const shown = useSkeletonShown(label);
  const ref = useServerStyles();
  let t1;
  if ($[0] !== height) {
    t1 = {
      blockSize: height
    };
    $[0] = height;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const t2 = !shown;
  let t3;
  if ($[2] !== t2) {
    t3 = /* @__PURE__ */ React.createElement(SkeletonArt, { shape: "rect", waiting: t2 });
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== ref || $[5] !== t1 || $[6] !== t3) {
    t4 = /* @__PURE__ */ React.createElement("div", { ref, className: "srp-chart__placeholder", style: t1 }, t3);
    $[4] = ref;
    $[5] = t1;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}
function niceTicks(lo, hi, count) {
  if (!(hi > lo)) {
    if (lo > 0) lo = 0;
    else if (lo < 0) hi = 0;
    else hi = 1;
  }
  const raw = (hi - lo) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw * (1 - 1e-9)) ?? 10 * mag;
  const out = [];
  for (let v = Math.floor(lo / step + 1e-9) * step; v < hi + step * (1 - 1e-9); v += step) out.push(+v.toPrecision(12));
  const end = out[out.length - 1] ?? lo;
  if (end < hi - 1e-9 * step) out.push(+(end + step).toPrecision(12));
  return out;
}
var at = (n) => +n.toFixed(2);
var poly = (cx, cy, pts) => "M" + pts.map(([x, y]) => `${at(cx + x)} ${at(cy + y)}`).join("L") + "Z";
var around = (k, r, turn = -90) => Array.from({
  length: k
}, (_, i) => {
  const a = (turn + 360 / k * i) * Math.PI / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
});
function markerPath(shape, cx, cy, r) {
  switch (shape % COLORS) {
    case 0:
      return `M${at(cx - r)} ${at(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    case 1:
      return poly(cx, cy, around(4, r * 1.25, 45));
    case 2:
      return poly(cx, cy, around(3, r * 1.4));
    case 3:
      return poly(cx, cy, around(4, r * 1.35));
    case 4:
      return poly(cx, cy, around(3, r * 1.4, 90));
    case 5:
      return poly(cx, cy, around(6, r * 1.15));
    case 6:
      return poly(cx, cy, around(10, r * 1.5).map(([x, y], i) => i % 2 ? [x * 0.5, y * 0.5] : [x, y]));
    default: {
      const a = r * 0.45, b = r * 1.25;
      return poly(cx, cy, [[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]);
    }
  }
}
var NONE = [];
var valueOf = (series, s, i) => {
  const v = series[s]?.values[i];
  return typeof v === "number" && isFinite(v) ? v : null;
};
var topOfSeries = (series, s, i) => {
  let t = 0;
  for (let k = 0; k <= s; k++) t += valueOf(series, k, i) ?? 0;
  return t;
};
function layout(series, n, type, stacked, start, pw, ph, t0, tN, width, rtl) {
  const band = pw / Math.max(1, n);
  const flip = (x2) => rtl ? width - x2 : x2;
  const x = (i) => flip(type === "bar" ? start + band * (i + 0.5) : n === 1 ? start + pw / 2 : start + INSET + i * (pw - 2 * INSET) / (n - 1));
  const y = (v) => PAD_TOP + ph * (1 - (v - t0) / (tN - t0 || 1));
  const py = (s, i) => y(stacked ? topOfSeries(series, s, i) : valueOf(series, s, i));
  const group = band * (series.length > 1 ? 0.8 : 0.6), bw = group / Math.max(1, series.length);
  const bar = (s, i) => {
    const v = valueOf(series, s, i);
    const x0 = start + band * (i + 0.5) - group / 2 + s * bw;
    const y1 = y(Math.max(v, 0)), y2 = y(Math.min(v, 0));
    return {
      x: rtl ? width - x0 - bw : x0,
      y: Math.min(y1, y2),
      w: bw,
      h: Math.max(1, Math.abs(y2 - y1)),
      neg: v < 0
    };
  };
  return {
    band,
    flip,
    x,
    y,
    py,
    bar
  };
}
var Marks = /* @__PURE__ */ React.memo(function Marks2(p) {
  const $ = _c(27);
  const {
    series,
    categories,
    type,
    stacked,
    start,
    pw,
    ph,
    width,
    rtl,
    labels,
    api
  } = p;
  const n = categories.length;
  const linear = type === "line" || type === "area";
  let t0;
  if ($[0] !== p) {
    t0 = (v) => p.formatValue ? p.formatValue(v) : displayNumber(v, p.locale);
    $[0] = p;
    $[1] = t0;
  } else {
    t0 = $[1];
  }
  const fmt = t0;
  let t1;
  if ($[2] !== series) {
    t1 = (s, i) => valueOf(series, s, i);
    $[2] = series;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const val = t1;
  let t2;
  if ($[4] !== api || $[5] !== categories || $[6] !== fmt || $[7] !== labels || $[8] !== linear || $[9] !== n || $[10] !== p.base || $[11] !== p.t0 || $[12] !== p.tN || $[13] !== p.tabI || $[14] !== p.tabS || $[15] !== ph || $[16] !== pw || $[17] !== rtl || $[18] !== series || $[19] !== stacked || $[20] !== start || $[21] !== type || $[22] !== val || $[23] !== width) {
    const {
      x,
      py,
      bar
    } = layout(series, n, type, stacked, start, pw, ph, p.t0, p.tN, width, rtl);
    t2 = series.map((sr, s_0) => {
      let d = "";
      let open = false;
      for (let i_0 = 0; i_0 < n; i_0++) {
        if (val(s_0, i_0) == null) {
          open = false;
          continue;
        }
        d = d + `${open ? "L" : "M"}${at(x(i_0))} ${at(py(s_0, i_0))}`;
        open = true;
      }
      return /* @__PURE__ */ React.createElement("g", { key: s_0, className: "srp-chart__series srp-chart--s" + (s_0 + 1), role: "group", "aria-label": series.length > 1 ? sr.name : void 0 }, linear && d ? /* @__PURE__ */ React.createElement("path", { className: "srp-chart__line", d, pathLength: 1, "aria-hidden": true }) : null, Array.from({
        length: n
      }, (_, i_1) => {
        const v_0 = val(s_0, i_1);
        if (v_0 == null) {
          return null;
        }
        const key = s_0 + ":" + i_1;
        const common = {
          ref: (el) => api.current.point(key, el),
          role: "img",
          "aria-label": labels.chartPoint(series.length > 1 ? sr.name : null, categories[i_1] ?? "", fmt(v_0)),
          tabIndex: p.tabS === s_0 && p.tabI === i_1 ? 0 : -1,
          onFocus: (e) => api.current.focus(s_0, i_1, e.currentTarget.matches(":focus-visible")),
          onBlur: () => api.current.blur()
        };
        if (linear) {
          return /* @__PURE__ */ React.createElement("path", { key: i_1, ...common, className: "srp-chart__marker srp-chart__point", d: markerPath(s_0, x(i_1), py(s_0, i_1), MARKER) });
        }
        const b = bar(s_0, i_1);
        return /* @__PURE__ */ React.createElement("rect", { key: i_1, ...common, className: cn("srp-chart__bar srp-chart__point", b.neg && "srp-chart__bar--neg"), x: at(b.x), y: at(b.y), width: at(b.w), height: at(b.h), fill: s_0 && series.length > 1 ? `url(#${p.base}-p${s_0})` : void 0 });
      }));
    });
    $[4] = api;
    $[5] = categories;
    $[6] = fmt;
    $[7] = labels;
    $[8] = linear;
    $[9] = n;
    $[10] = p.base;
    $[11] = p.t0;
    $[12] = p.tN;
    $[13] = p.tabI;
    $[14] = p.tabS;
    $[15] = ph;
    $[16] = pw;
    $[17] = rtl;
    $[18] = series;
    $[19] = stacked;
    $[20] = start;
    $[21] = type;
    $[22] = val;
    $[23] = width;
    $[24] = t2;
  } else {
    t2 = $[24];
  }
  let t3;
  if ($[25] !== t2) {
    t3 = /* @__PURE__ */ React.createElement(React.Fragment, null, t2);
    $[25] = t2;
    $[26] = t3;
  } else {
    t3 = $[26];
  }
  return t3;
});
function ChartRender({
  ref,
  ...props
}) {
  const nameRef = useNameCheck("Chart", NAME_HOW.title, ref);
  const rest = omit(props, OWN);
  const locale = useLocale();
  const labels = useSettings(words).labels;
  const busy = !!props.loading;
  const base = domId("srp-chart", React.useId());
  const type = oneOf(TYPES, props.type, "line");
  const categories = props.categories || NONE;
  const heat = type === "heatmap";
  const series = React.useMemo(() => (props.series || []).slice(0, heat ? ROWS : COLORS), [props.series, heat]);
  const n = categories.length;
  const waiting = busy && !n;
  const height = Math.max(80, Math.round(Number(props.height) || (heat ? series.length * ROW + PAD_TOP + AXIS : 240)));
  const fmt = (v) => props.formatValue ? props.formatValue(v) : displayNumber(v, locale);
  const [ownView, setOwnView] = React.useState(() => oneOf(VIEWS, props.defaultView, "chart"));
  const view = oneOf(VIEWS, props.view, ownView);
  const [width, setWidth] = React.useState(WIDTH);
  const [rtl, setRtl] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [hoverRow, setHoverRow] = React.useState(null);
  const [hushed, setHushed] = React.useState(false);
  const [focus, setFocus] = React.useState(null);
  const [last, setLast] = React.useState(null);
  const [sort, setSort] = React.useState({
    col: -1,
    dir: "none"
  });
  const frame = React.useRef(null);
  const tipRef = React.useRef(null);
  const points = React.useRef(/* @__PURE__ */ new Map());
  const hasTitle = props.title != null && props.title !== false && props.title !== "";
  useIsoLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setWidth(w);
      setRtl(getComputedStyle(el).direction === "rtl");
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);
  const val = (s, i) => valueOf(series, s, i);
  const all = [];
  series.forEach((_, s_0) => {
    for (let i_0 = 0; i_0 < n; i_0++) {
      const v_0 = val(s_0, i_0);
      if (v_0 != null) all.push({
        s: s_0,
        i: i_0,
        v: v_0
      });
    }
  });
  const linear = type === "line" || type === "area";
  const stacked = type === "area" && !!props.stacked && series.length > 1;
  const topOf = (s_1, i_1) => topOfSeries(series, s_1, i_1);
  const heights = all.map((p) => stacked ? topOf(p.s, p.i) : p.v);
  let lo = heights.length ? Math.min(...heights) : 0, hi = heights.length ? Math.max(...heights) : 1;
  const onZero = type === "bar" || type === "area";
  if (onZero || lo >= 0 && lo <= hi / 2) lo = Math.min(lo, 0);
  if (onZero || hi <= 0 && hi >= lo / 2) hi = Math.max(hi, 0);
  const ticks = niceTicks(lo, hi, Math.max(2, Math.floor((height - PAD_TOP - AXIS) / 48)));
  const t0 = ticks[0] ?? lo, tN = ticks[ticks.length - 1] ?? hi;
  const tickText = ticks.map(fmt);
  const start = Math.ceil(Math.max(...(heat ? series.map((sr) => sr.name) : tickText).map((t) => t.length)) * CHAR) + 10;
  const pw = Math.max(1, width - start - PAD_END), ph = Math.max(1, height - PAD_TOP - AXIS);
  const {
    band,
    flip,
    x: xAt,
    y: yAt,
    py,
    bar
  } = layout(series, n, type, stacked, start, pw, ph, t0, tN, width, rtl);
  const step = type === "bar" || heat ? band : n > 1 ? (pw - 2 * INSET) / (n - 1) : pw;
  const every = Math.max(1, Math.ceil((Math.max(1, ...categories.map((c) => c.length)) * CHAR + 8) / Math.max(1, step)));
  const diverging = heat && oneOf(SCALES, props.scale, "sequential") === "diverging";
  const midpoint = typeof props.midpoint === "number" && isFinite(props.midpoint) ? props.midpoint : 0;
  const steps = diverging ? 7 : 5;
  const vlo = all.length ? Math.min(...all.map((p_0) => p_0.v)) : 0, vhi = all.length ? Math.max(...all.map((p_1) => p_1.v)) : 1;
  const reach = Math.max(Math.abs(vlo - midpoint), Math.abs(vhi - midpoint)) || 1;
  const edges = Array.from({
    length: steps + 1
  }, (__0, k) => diverging ? midpoint - reach + 2 * reach * k / steps : vlo + (vhi - vlo) * k / steps);
  const stepOf = (v_1) => diverging ? Math.min(steps, Math.max(1, Math.floor((v_1 - midpoint + reach) / (2 * reach) * steps) + 1)) : vhi > vlo ? Math.min(steps, Math.floor((v_1 - vlo) / (vhi - vlo) * steps) + 1) : Math.ceil(steps / 2);
  const rh = ph / Math.max(1, series.length);
  const cell = (s_2, i_2) => ({
    x: rtl ? width - start - band * (i_2 + 1) : start + band * i_2,
    y: PAD_TOP + rh * s_2,
    w: band,
    h: rh
  });
  const donut = type === "donut";
  const positive = donut ? categories.map((name, i_3) => ({
    name,
    v: val(0, i_3) ?? 0
  })).filter((x) => x.v > 0) : [];
  const slices = positive.length > COLORS ? [...positive.slice(0, COLORS - 1), {
    name: labels.chartOther,
    v: positive.slice(COLORS - 1).reduce((a, b) => a + b.v, 0)
  }] : positive;
  const total = slices.reduce((a_0, b_0) => a_0 + b_0.v, 0);
  const share = (v_2) => labels.chartShare(fmt(v_2), displayNumber(v_2 / total, locale, {
    style: "percent",
    maximumFractionDigits: v_2 / total < 0.1 ? 1 : 0
  }));
  const kind = labels.chartKind(type);
  const summary = donut ? [labels.chartSummary(kind, slices.length ? 1 : 0, slices.length, slices[0]?.name ?? "", slices[slices.length - 1]?.name ?? "")] : [labels.chartSummary(kind, series.length, n, categories[0] ?? "", categories[n - 1] ?? "")];
  if (donut && slices.length) {
    const min = slices.reduce((a_1, b_1) => b_1.v < a_1.v ? b_1 : a_1), max = slices.reduce((a_2, b_2) => b_2.v > a_2.v ? b_2 : a_2);
    summary.push(labels.chartTotal(fmt(total)), labels.chartRange(series[0]?.name ?? "", share(min.v), min.name, share(max.v), max.name));
  }
  if (!donut) series.forEach((sr_0, s_3) => {
    const mine = all.filter((p_2) => p_2.s === s_3);
    if (!mine.length) return;
    const min_0 = mine.reduce((a_3, b_3) => b_3.v < a_3.v ? b_3 : a_3), max_0 = mine.reduce((a_4, b_4) => b_4.v > a_4.v ? b_4 : a_4);
    summary.push(labels.chartRange(sr_0.name, fmt(min_0.v), categories[min_0.i] ?? "", fmt(max_0.v), categories[max_0.i] ?? ""));
  });
  const current = donut ? slices.length ? {
    s: 0,
    i: last && last.i < slices.length ? last.i : 0
  } : null : last && val(last.s, last.i) != null ? last : all[0] ? {
    s: all[0].s,
    i: all[0].i
  } : null;
  const onKeyDown = (e) => {
    if (!current || e.altKey || e.ctrlKey || e.metaKey) return;
    const {
      s: s_4,
      i: i_4
    } = current;
    if (donut) {
      const k_0 = e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight") ? i_4 + 1 : e.key === "ArrowUp" || e.key === (rtl ? "ArrowRight" : "ArrowLeft") ? i_4 - 1 : e.key === "Home" ? 0 : e.key === "End" ? slices.length - 1 : null;
      if (k_0 == null) return;
      e.preventDefault();
      if (k_0 >= 0 && k_0 < slices.length) {
        setLast({
          s: 0,
          i: k_0
        });
        points.current.get("0:" + k_0)?.focus();
      }
      return;
    }
    const along = (from, by) => {
      for (let k_1 = from + by; k_1 >= 0 && k_1 < n; k_1 += by) if (val(s_4, k_1) != null) return k_1;
      return null;
    };
    const across = (by_0) => {
      for (let k_2 = s_4 + by_0; k_2 >= 0 && k_2 < series.length; k_2 += by_0) if (val(k_2, i_4) != null) return k_2;
      return null;
    };
    const ahead = rtl ? -1 : 1;
    let k_3, to = null;
    switch (e.key) {
      case "ArrowRight":
        k_3 = along(i_4, ahead);
        if (k_3 != null) to = {
          s: s_4,
          i: k_3
        };
        break;
      case "ArrowLeft":
        k_3 = along(i_4, -ahead);
        if (k_3 != null) to = {
          s: s_4,
          i: k_3
        };
        break;
      case "ArrowDown":
        k_3 = across(1);
        if (k_3 != null) to = {
          s: k_3,
          i: i_4
        };
        break;
      case "ArrowUp":
        k_3 = across(-1);
        if (k_3 != null) to = {
          s: k_3,
          i: i_4
        };
        break;
      case "Home":
        k_3 = along(-1, 1);
        if (k_3 != null) to = {
          s: s_4,
          i: k_3
        };
        break;
      case "End":
        k_3 = along(n, -1);
        if (k_3 != null) to = {
          s: s_4,
          i: k_3
        };
        break;
      default:
        return;
    }
    e.preventDefault();
    if (to) {
      setLast(to);
      points.current.get(to.s + ":" + to.i)?.focus();
    }
  };
  const onPointerMove = (e_0) => {
    if (!n || donut) return;
    const x_0 = flip(e_0.clientX - e_0.currentTarget.getBoundingClientRect().left);
    const i_5 = type === "bar" ? Math.floor((x_0 - start) / band) : n === 1 ? 0 : Math.round((x_0 - start - INSET) * (n - 1) / Math.max(1, pw - 2 * INSET));
    const to_0 = x_0 >= start - (heat ? 0 : INSET) && i_5 >= 0 && i_5 < n ? i_5 : null;
    if (heat) {
      const s_5 = Math.floor((e_0.clientY - e_0.currentTarget.getBoundingClientRect().top - PAD_TOP) / rh);
      const row = to_0 != null && s_5 >= 0 && s_5 < series.length && val(s_5, to_0) != null ? s_5 : null;
      if (row !== hoverRow || (row == null ? null : to_0) !== hover) {
        setHoverRow(row);
        setHover(row == null ? null : to_0);
        setHushed(false);
      }
      return;
    }
    if (to_0 !== hover) {
      setHover(to_0);
      setHushed(false);
    }
  };
  const shown = hushed ? null : focus ? focus.i : hover;
  const shownRow = focus ? focus.s : hoverRow;
  const api = useLatest({
    focus: (s_6, i_6, ring) => {
      setLast({
        s: s_6,
        i: i_6
      });
      setHushed(false);
      setFocus({
        s: s_6,
        i: i_6,
        ring
      });
    },
    blur: () => setFocus(null),
    point: (key, el_0) => {
      if (el_0) points.current.set(key, el_0);
      else points.current.delete(key);
    }
  });
  useIsoLayoutEffect(() => {
    if (shown == null || donut) return;
    const on = (heat ? [shownRow ?? -1] : series.map((__1, s_7) => s_7)).map((s_8) => points.current.get(s_8 + ":" + shown)).filter((el_1) => !!el_1);
    for (const el_2 of on) el_2.setAttribute("data-active", "");
    return () => {
      for (const el_3 of on) el_3.removeAttribute("data-active");
    };
  });
  React.useEffect(() => {
    if (shown == null) return;
    const esc = (e_1) => {
      if (e_1.key === "Escape" && !isComposing(e_1)) {
        e_1.preventDefault();
        e_1.stopPropagation();
        setHushed(true);
      }
    };
    document.addEventListener("keydown", esc, true);
    return () => document.removeEventListener("keydown", esc, true);
  }, [shown]);
  const changeView = (v_3) => {
    if (props.view === void 0) setOwnView(v_3);
    props.onViewChange?.(v_3);
  };
  const zero = yAt(Math.min(Math.max(0, t0), tN));
  const fill = (s_9, count = series.length) => s_9 && count > 1 ? `url(#${base}-p${s_9})` : void 0;
  const areaPath = (s_10) => {
    let d = "";
    for (let i_7 = 0; i_7 < n; ) {
      if (!stacked && val(s_10, i_7) == null) {
        i_7++;
        continue;
      }
      let j = i_7;
      while (j + 1 < n && (stacked || val(s_10, j + 1) != null)) j++;
      const top = [], bottom = [];
      for (let k_4 = i_7; k_4 <= j; k_4++) {
        top.push(`${at(xAt(k_4))} ${at(stacked ? yAt(topOf(s_10, k_4)) : yAt(val(s_10, k_4)))}`);
        bottom.push(`${at(xAt(k_4))} ${at(stacked && s_10 ? yAt(topOf(s_10 - 1, k_4)) : zero)}`);
      }
      d += "M" + top.join("L") + "L" + bottom.reverse().join("L") + "Z";
      i_7 = j + 1;
    }
    return d;
  };
  const cx = width / 2, cy = height / 2, R = Math.max(12, Math.min(width, height) / 2 - 6), IN = R * 0.62;
  const angles = slices.reduce((a_5, sl) => [...a_5, (a_5[a_5.length - 1] ?? 0) + 2 * Math.PI * sl.v / (total || 1)], [-Math.PI / 2]);
  const angle = (k_5) => angles[k_5] ?? 0;
  const ring_0 = (a0, a1, r0, r1) => {
    const p_3 = (a_6, r) => `${at(cx + r * Math.cos(a_6))} ${at(cy + r * Math.sin(a_6))}`;
    if (a1 - a0 >= 2 * Math.PI - 1e-6) return `M${p_3(-Math.PI / 2, r1)}A${at(r1)} ${at(r1)} 0 1 1 ${p_3(Math.PI / 2, r1)}A${at(r1)} ${at(r1)} 0 1 1 ${p_3(-Math.PI / 2, r1)}ZM${p_3(-Math.PI / 2, r0)}A${at(r0)} ${at(r0)} 0 1 0 ${p_3(Math.PI / 2, r0)}A${at(r0)} ${at(r0)} 0 1 0 ${p_3(-Math.PI / 2, r0)}Z`;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${p_3(a0, r1)}A${at(r1)} ${at(r1)} 0 ${big} 1 ${p_3(a1, r1)}L${p_3(a1, r0)}A${at(r0)} ${at(r0)} 0 ${big} 0 ${p_3(a0, r0)}Z`;
  };
  const tipRows = shown == null ? [] : donut ? slices[shown] ? [{
    s: shown,
    name: "",
    text: share(slices[shown].v)
  }] : [] : series.map((sr_1, s_11) => ({
    s: s_11,
    name: sr_1.name,
    v: val(s_11, shown)
  })).filter((r_0) => r_0.v != null && (!heat || r_0.s === shownRow)).map((r_1) => ({
    s: r_1.s,
    name: r_1.name,
    text: fmt(r_1.v)
  }));
  const mid = donut && shown != null ? (angle(shown) + angle(shown + 1)) / 2 : 0;
  const tip = shown == null || !tipRows.length ? null : donut ? {
    i: shown,
    title: slices[shown]?.name,
    x: flip(cx + R * Math.cos(mid)),
    y: cy + R * Math.sin(mid)
  } : heat ? {
    i: shown,
    title: categories[shown],
    x: cell(tipRows[0].s, shown).x + band / 2,
    y: cell(tipRows[0].s, shown).y + rh / 2
  } : {
    i: shown,
    title: categories[shown],
    x: xAt(shown),
    y: Math.min(...tipRows.map((r_2) => py(r_2.s, shown)))
  };
  useIsoLayoutEffect(() => {
    const el_4 = tipRef.current;
    if (!el_4 || !tip) return;
    const w_0 = el_4.offsetWidth, h = el_4.offsetHeight;
    const after = tip.x + 12, before = tip.x - 12 - w_0;
    const beside = after + w_0 <= width ? after : before >= 0 ? before : null;
    const top_0 = beside != null ? tip.y - h / 2 : tip.y - 12 - h >= 0 ? tip.y - 12 - h : tip.y + 12;
    el_4.style.left = (beside ?? Math.min(Math.max(0, tip.x - w_0 / 2), Math.max(0, width - w_0))) + "px";
    el_4.style.top = (beside != null ? Math.min(Math.max(0, top_0), Math.max(0, height - h)) : top_0) + "px";
  });
  const order = Array.from({
    length: n
  }, (__2, i_8) => i_8);
  if (sort.dir !== "none") {
    const sign = sort.dir === "ascending" ? 1 : -1;
    order.sort((a_7, b_5) => {
      if (sort.col < 0) return (a_7 - b_5) * sign;
      const va = val(sort.col, a_7), vb = val(sort.col, b_5);
      if (va == null || vb == null) return va == null ? vb == null ? a_7 - b_5 : 1 : -1;
      return (va - vb) * sign || a_7 - b_5;
    });
  }
  const onSort = (col) => setSort((was) => ({
    col,
    dir: was.col === col && was.dir === "ascending" ? "descending" : "ascending"
  }));
  const lineX = [flip(start), flip(width - PAD_END)].sort((a_8, b_6) => a_8 - b_6);
  return /* @__PURE__ */ React.createElement("figure", { ...rest, ref: nameRef, className: cn("srp-chart", "srp-chart--" + type, props.className), "data-component": "chart", "data-type": type, "data-view": view, "aria-busy": rest["aria-busy"] ?? (busy || void 0), "aria-labelledby": rest["aria-labelledby"] || (hasTitle && !rest["aria-label"] ? base + "-title" : void 0) }, hasTitle ? /* @__PURE__ */ React.createElement("figcaption", { className: "srp-chart__title", id: base + "-title" }, props.title) : null, /* @__PURE__ */ React.createElement(Button, { className: "srp-chart__toggle", variant: "ghost", size: "sm", disabled: waiting || void 0, onClick: () => changeView(view === "chart" ? "table" : "chart") }, view === "chart" ? labels.chartShowTable : labels.chartShowChart), waiting ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-chart__frame", ref: frame }, /* @__PURE__ */ React.createElement(ChartPlaceholder, { height, label: props.loadingLabel || labels.loading })), props.hideLegend ? null : /* @__PURE__ */ React.createElement("div", { className: "srp-chart__legend srp-chart__legend--waiting", "aria-hidden": true })) : view === "table" ? /* @__PURE__ */ React.createElement(Table, { className: "srp-chart__table", size: "sm", caption: hasTitle ? props.title : rest["aria-label"], hideCaption: true }, /* @__PURE__ */ React.createElement(TableHead, null, /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableHeaderCell, { scope: "col", sort: sort.col === -1 ? sort.dir : "none", onSort: () => onSort(-1) }, props.categoryLabel || labels.chartCategory), series.map((sr_2, s_12) => /* @__PURE__ */ React.createElement(TableHeaderCell, { key: s_12, scope: "col", align: "end", sort: sort.col === s_12 ? sort.dir : "none", onSort: () => onSort(s_12) }, sr_2.name)))), /* @__PURE__ */ React.createElement(TableBody, null, order.map((i_9) => /* @__PURE__ */ React.createElement(TableRow, { key: i_9 }, /* @__PURE__ */ React.createElement(TableHeaderCell, { scope: "row" }, categories[i_9]), series.map((__3, s_13) => {
    const v_4 = val(s_13, i_9);
    return /* @__PURE__ */ React.createElement(TableCell, { key: s_13, align: "end" }, v_4 == null ? labels.chartNoValue : fmt(v_4));
  }))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "srp-chart__frame", ref: frame }, /* @__PURE__ */ React.createElement("svg", { className: "srp-chart__plot", width, height, viewBox: `0 0 ${width} ${height}`, role: "group", "aria-label": kind, "aria-describedby": base + "-summary", onKeyDown, onPointerMove, onPointerLeave: () => {
    setHover(null);
    setHushed(false);
  } }, /* @__PURE__ */ React.createElement("desc", { id: base + "-summary" }, summary.join(" ")), type === "bar" && series.length > 1 || donut && slices.length > 1 ? /* @__PURE__ */ React.createElement("defs", null, Array.from({
    length: donut ? slices.length : series.length
  }, (__4, s_14) => s_14 ? /* @__PURE__ */ React.createElement("pattern", { key: s_14, id: `${base}-p${s_14}`, className: "srp-chart__pattern srp-chart--s" + (s_14 + 1), patternUnits: "userSpaceOnUse", width: "6", height: "6", patternTransform: s_14 === 1 || s_14 === 4 ? "rotate(45)" : s_14 === 2 ? "rotate(-45)" : void 0 }, /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__pattern-fill", width: "6", height: "6" }), s_14 <= 3 ? /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__pattern-mark", width: s_14 === 3 ? 1.5 : 6, height: s_14 === 3 ? 6 : 1.5, x: s_14 === 3 ? 2.25 : 0, y: s_14 === 3 ? 0 : 2.25 }) : s_14 <= 5 ? /* @__PURE__ */ React.createElement("circle", { className: "srp-chart__pattern-mark", cx: "3", cy: "3", r: s_14 === 4 ? 1.1 : 1.7 }) : /* @__PURE__ */ React.createElement("path", { className: "srp-chart__pattern-mark", d: s_14 === 6 ? "M0 2.25H6V3.75H0ZM2.25 0H3.75V6H2.25Z" : "M0 0H3V3H0ZM3 3H6V6H3Z" })) : null)) : null, donut ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("g", { transform: rtl ? `matrix(-1 0 0 1 ${width} 0)` : void 0 }, slices.map((sl_0, k_6) => /* @__PURE__ */ React.createElement("path", { key: k_6, ref: (el_5) => {
    if (el_5) points.current.set("0:" + k_6, el_5);
    else points.current.delete("0:" + k_6);
  }, role: "img", "aria-label": labels.chartPoint(null, sl_0.name, share(sl_0.v)), tabIndex: current && current.i === k_6 ? 0 : -1, className: "srp-chart__slice srp-chart__point srp-chart--s" + (k_6 + 1), d: ring_0(angle(k_6), angle(k_6 + 1), IN, R), fill: fill(k_6, slices.length), fillRule: "evenodd", "data-active": shown === k_6 ? "" : void 0, onPointerEnter: () => {
    if (k_6 !== hover) {
      setHover(k_6);
      setHushed(false);
    }
  }, onFocus: (e_2) => {
    setLast({
      s: 0,
      i: k_6
    });
    setHushed(false);
    setFocus({
      s: 0,
      i: k_6,
      ring: e_2.currentTarget.matches(":focus-visible")
    });
  }, onBlur: () => setFocus(null) })), focus && focus.ring && slices[focus.i] ? /* @__PURE__ */ React.createElement("path", { className: "srp-chart__focus", "aria-hidden": true, fillRule: "evenodd", d: ring_0(angle(focus.i), angle(focus.i + 1), IN - 3, R + 3) }) : null), slices.length ? /* @__PURE__ */ React.createElement("text", { className: "srp-chart__total", "aria-hidden": true, x: at(cx), y: at(cy), dy: "0.32em", textAnchor: "middle" }, labels.chartTotal(fmt(total))) : null) : heat ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("g", { className: "srp-chart__axis", "aria-hidden": true }, series.map((sr_3, s_15) => /* @__PURE__ */ React.createElement("text", { key: s_15, className: "srp-chart__label", x: flip(start - 6), y: at(PAD_TOP + rh * (s_15 + 0.5)), dy: "0.32em", textAnchor: rtl ? "start" : "end" }, sr_3.name)), categories.map((c_0, i_10) => i_10 % every ? null : /* @__PURE__ */ React.createElement("text", { key: i_10, className: "srp-chart__label", x: at(cell(0, i_10).x + band / 2), y: PAD_TOP + ph + AXIS - 6, textAnchor: "middle" }, c_0))), series.map((sr_4, s_16) => /* @__PURE__ */ React.createElement("g", { key: s_16, className: "srp-chart__series", role: "group", "aria-label": sr_4.name }, Array.from({
    length: n
  }, (__5, i_11) => {
    const v_5 = val(s_16, i_11), c_1 = cell(s_16, i_11);
    if (v_5 == null) return /* @__PURE__ */ React.createElement("rect", { key: i_11, className: "srp-chart__cell srp-chart__cell--empty", "aria-hidden": true, x: at(c_1.x), y: at(c_1.y), width: at(c_1.w), height: at(c_1.h) });
    return /* @__PURE__ */ React.createElement("rect", { key: i_11, ref: (el_6) => {
      if (el_6) points.current.set(s_16 + ":" + i_11, el_6);
      else points.current.delete(s_16 + ":" + i_11);
    }, role: "img", "aria-label": labels.chartPoint(sr_4.name, categories[i_11] ?? "", fmt(v_5)), tabIndex: current && current.s === s_16 && current.i === i_11 ? 0 : -1, className: "srp-chart__cell srp-chart__point srp-chart__cell--" + (diverging ? "d" : "s") + stepOf(v_5), x: at(c_1.x), y: at(c_1.y), width: at(c_1.w), height: at(c_1.h), onFocus: (e_3) => api.current.focus(s_16, i_11, e_3.currentTarget.matches(":focus-visible")), onBlur: () => api.current.blur() });
  }))), focus && focus.ring && val(focus.s, focus.i) != null ? (() => {
    const c_2 = cell(focus.s, focus.i);
    return /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__focus", "aria-hidden": true, x: at(c_2.x + 1.5), y: at(c_2.y + 1.5), width: at(Math.max(1, c_2.w - 3)), height: at(Math.max(1, c_2.h - 3)), rx: "2" });
  })() : null) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("g", { className: "srp-chart__grid", "aria-hidden": true }, ticks.map((t_0, k_7) => /* @__PURE__ */ React.createElement("g", { key: k_7 }, /* @__PURE__ */ React.createElement("line", { className: t_0 === 0 && t0 < 0 ? "srp-chart__zero" : "srp-chart__gridline", x1: lineX[0], x2: lineX[1], y1: at(yAt(t_0)), y2: at(yAt(t_0)) }), /* @__PURE__ */ React.createElement("text", { className: "srp-chart__label", x: flip(start - 6), y: at(yAt(t_0)), dy: "0.32em", textAnchor: rtl ? "start" : "end" }, tickText[k_7])))), /* @__PURE__ */ React.createElement("g", { className: "srp-chart__axis", "aria-hidden": true }, /* @__PURE__ */ React.createElement("line", { className: "srp-chart__baseline", x1: lineX[0], x2: lineX[1], y1: at(type === "bar" ? zero : PAD_TOP + ph), y2: at(type === "bar" ? zero : PAD_TOP + ph) }), categories.map((c_3, i_12) => i_12 % every ? null : /* @__PURE__ */ React.createElement("text", { key: i_12, className: "srp-chart__label", x: at(xAt(i_12)), y: PAD_TOP + ph + AXIS - 6, textAnchor: "middle" }, c_3))), type === "area" ? /* @__PURE__ */ React.createElement("g", { "aria-hidden": true }, series.map((__6, s_17) => /* @__PURE__ */ React.createElement("path", { key: s_17, className: "srp-chart__area srp-chart--s" + (s_17 + 1), d: areaPath(s_17) }))) : null, shown != null ? /* @__PURE__ */ React.createElement("line", { className: "srp-chart__cursor", "aria-hidden": true, x1: at(xAt(shown)), x2: at(xAt(shown)), y1: PAD_TOP, y2: PAD_TOP + ph }) : null, /* @__PURE__ */ React.createElement(Marks, { series, categories, type, stacked, start, pw, ph, t0, tN, width, rtl, formatValue: props.formatValue, locale, labels, base, tabS: current ? current.s : -1, tabI: current ? current.i : -1, api }), focus && focus.ring && val(focus.s, focus.i) != null ? (() => {
    if (linear) return /* @__PURE__ */ React.createElement("circle", { className: "srp-chart__focus", "aria-hidden": true, cx: at(xAt(focus.i)), cy: at(py(focus.s, focus.i)), r: MARKER + 5 });
    const b_7 = bar(focus.s, focus.i);
    return /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__focus", "aria-hidden": true, x: at(b_7.x - 3), y: at(b_7.y - 3), width: at(b_7.w + 6), height: at(b_7.h + 6), rx: "2" });
  })() : null)), tip ? /* @__PURE__ */ React.createElement("div", { ref: tipRef, className: "srp-chart__tip", "aria-hidden": true }, /* @__PURE__ */ React.createElement("div", { className: "srp-chart__tip-title" }, tip.title), tipRows.map((r_3) => /* @__PURE__ */ React.createElement("div", { key: r_3.s, className: cn("srp-chart__tip-row", "srp-chart--s" + (r_3.s + 1), focus && focus.s === r_3.s && "srp-chart__tip-row--focus") }, /* @__PURE__ */ React.createElement("svg", { className: "srp-chart__swatch", width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": true, focusable: "false" }, linear ? /* @__PURE__ */ React.createElement("path", { className: "srp-chart__marker", d: markerPath(r_3.s, 6, 6, MARKER) }) : heat ? /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__cell srp-chart__cell--" + (diverging ? "d" : "s") + stepOf(val(r_3.s, tip.i) ?? 0), x: "1", y: "1", width: "10", height: "10" }) : /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__bar", x: "1", y: "1", width: "10", height: "10", fill: fill(r_3.s, donut ? slices.length : series.length) })), series.length > 1 && !donut || heat ? /* @__PURE__ */ React.createElement("span", { className: "srp-chart__tip-name" }, r_3.name) : null, /* @__PURE__ */ React.createElement("span", { className: "srp-chart__tip-value" }, r_3.text)))) : null), !props.hideLegend && heat && all.length ? (
    // A heatmap's legend is its scale: its lowest value, a swatch per step from low to high, and its highest.
    /* @__PURE__ */ React.createElement("div", { className: "srp-chart__legend srp-chart__legend--scale", "aria-hidden": true }, /* @__PURE__ */ React.createElement("span", { className: "srp-chart__key-value" }, fmt(edges[0] ?? 0)), /* @__PURE__ */ React.createElement("span", { className: "srp-chart__scale" }, Array.from({
      length: steps
    }, (__7, k_8) => /* @__PURE__ */ React.createElement("svg", { key: k_8, className: "srp-chart__swatch", width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__cell srp-chart__cell--" + (diverging ? "d" : "s") + (k_8 + 1), width: "12", height: "12" })))), /* @__PURE__ */ React.createElement("span", { className: "srp-chart__key-value" }, fmt(edges[steps] ?? 0)))
  ) : !props.hideLegend && donut && slices.length ? (
    // A donut's legend names each slice with its share, so the slices are told apart in words, not by color alone.
    /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-chart__legend", "aria-hidden": true }, slices.map((sl_1, k_9) => /* @__PURE__ */ React.createElement("li", { key: k_9, className: "srp-chart__key srp-chart--s" + (k_9 + 1) }, /* @__PURE__ */ React.createElement("svg", { className: "srp-chart__swatch", width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": true, focusable: "false" }, /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__bar", x: "1", y: "1", width: "10", height: "10", fill: fill(k_9, slices.length) })), sl_1.name, /* @__PURE__ */ React.createElement("span", { className: "srp-chart__key-value" }, share(sl_1.v)))))
  ) : !props.hideLegend && series.length && !donut ? /* @__PURE__ */ React.createElement("ul", { role: "list", className: "srp-chart__legend", "aria-hidden": true }, series.map((sr_5, s_18) => /* @__PURE__ */ React.createElement("li", { key: s_18, className: "srp-chart__key srp-chart--s" + (s_18 + 1) }, /* @__PURE__ */ React.createElement("svg", { className: "srp-chart__swatch", width: "20", height: "12", viewBox: "0 0 20 12", "aria-hidden": true, focusable: "false" }, linear ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { className: "srp-chart__line", d: "M1 6H19" }), /* @__PURE__ */ React.createElement("path", { className: "srp-chart__marker", d: markerPath(s_18, 10, 6, MARKER) })) : /* @__PURE__ */ React.createElement("rect", { className: "srp-chart__bar", x: "3", y: "1", width: "14", height: "10", fill: fill(s_18) })), sr_5.name))) : null));
}
var Chart = /* @__PURE__ */ named("Chart", ChartRender);
export {
  Chart,
  markerPath,
  niceTicks
};
//# sourceMappingURL=Chart.js.map
