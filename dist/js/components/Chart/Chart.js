"use client";

// src/components/Chart/Chart.tsx
import * as React from "react";
import { cn, domId, oneOf, omit, useIsoLayoutEffect } from "../../internal/cn.js";
import { component } from "../../internal/component.js";
import { displayNumber } from "../../internal/numbers.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck.js";
import { isComposing } from "../../internal/ime.js";
import { Button } from "../Button/Button.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../Table/Table.js";
import { en as words } from "./labels.js";
var OWN = { type: 1, title: 1, categories: 1, series: 1, formatValue: 1, categoryLabel: 1, height: 1, hideLegend: 1, view: 1, defaultView: 1, onViewChange: 1, className: 1 };
var TYPES = ["line", "bar"];
var VIEWS = ["chart", "table"];
var COLORS = 8;
var CHAR = 7.2;
var PAD_TOP = 8;
var PAD_END = 8;
var AXIS = 24;
var INSET = 10;
var MARKER = 4;
var WIDTH = 640;
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
  if (out[out.length - 1] < hi - 1e-9 * step) out.push(+(out[out.length - 1] + step).toPrecision(12));
  return out;
}
var at = (n) => +n.toFixed(2);
var poly = (cx, cy, pts) => "M" + pts.map(([x, y]) => `${at(cx + x)} ${at(cy + y)}`).join("L") + "Z";
var around = (k, r, turn = -90) => Array.from({ length: k }, (_, i) => {
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
var Chart = /* @__PURE__ */ component("Chart", function Chart2(props, ref) {
  const nameRef = useNameCheck("Chart", NAME_HOW.title, ref);
  const rest = omit(props, OWN);
  const locale = useLocale();
  const labels = useSettings(words).labels;
  const base = domId("dk-chart", React.useId());
  const type = oneOf(TYPES, props.type, "line");
  const categories = props.categories || [];
  const series = (props.series || []).slice(0, COLORS);
  const n = categories.length;
  const height = Math.max(80, Math.round(Number(props.height) || 240));
  const fmt = (v) => props.formatValue ? props.formatValue(v) : displayNumber(v, locale);
  const [ownView, setOwnView] = React.useState(() => oneOf(VIEWS, props.defaultView, "chart"));
  const view = oneOf(VIEWS, props.view, ownView);
  const [width, setWidth] = React.useState(WIDTH);
  const [rtl, setRtl] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [hushed, setHushed] = React.useState(false);
  const [focus, setFocus] = React.useState(null);
  const [last, setLast] = React.useState(null);
  const [sort, setSort] = React.useState({ col: -1, dir: "none" });
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
  const val = (s, i) => {
    const v = series[s]?.values[i];
    return typeof v === "number" && isFinite(v) ? v : null;
  };
  const all = [];
  series.forEach((_, s) => {
    for (let i = 0; i < n; i++) {
      const v = val(s, i);
      if (v != null) all.push({ s, i, v });
    }
  });
  let lo = all.length ? Math.min(...all.map((p) => p.v)) : 0, hi = all.length ? Math.max(...all.map((p) => p.v)) : 1;
  if (type === "bar" || lo >= 0 && lo <= hi / 2) lo = Math.min(lo, 0);
  if (type === "bar" || hi <= 0 && hi >= lo / 2) hi = Math.max(hi, 0);
  const ticks = niceTicks(lo, hi, Math.max(2, Math.floor((height - PAD_TOP - AXIS) / 48)));
  const t0 = ticks[0], tN = ticks[ticks.length - 1];
  const tickText = ticks.map(fmt);
  const start = Math.ceil(Math.max(...tickText.map((t) => t.length)) * CHAR) + 10;
  const pw = Math.max(1, width - start - PAD_END), ph = Math.max(1, height - PAD_TOP - AXIS);
  const band = pw / Math.max(1, n);
  const flip = (x) => rtl ? width - x : x;
  const xAt = (i) => flip(type === "bar" ? start + band * (i + 0.5) : n === 1 ? start + pw / 2 : start + INSET + i * (pw - 2 * INSET) / (n - 1));
  const yAt = (v) => PAD_TOP + ph * (1 - (v - t0) / (tN - t0 || 1));
  const step = type === "bar" ? band : n > 1 ? (pw - 2 * INSET) / (n - 1) : pw;
  const every = Math.max(1, Math.ceil((Math.max(1, ...categories.map((c) => c.length)) * CHAR + 8) / Math.max(1, step)));
  const kind = labels.chartKind(type);
  const summary = [labels.chartSummary(kind, series.length, n, categories[0] ?? "", categories[n - 1] ?? "")];
  series.forEach((sr, s) => {
    const mine = all.filter((p) => p.s === s);
    if (!mine.length) return;
    const min = mine.reduce((a, b) => b.v < a.v ? b : a), max = mine.reduce((a, b) => b.v > a.v ? b : a);
    summary.push(labels.chartRange(sr.name, fmt(min.v), categories[min.i], fmt(max.v), categories[max.i]));
  });
  const current = last && val(last.s, last.i) != null ? last : all.length ? { s: all[0].s, i: all[0].i } : null;
  const onKeyDown = (e) => {
    if (!current || e.altKey || e.ctrlKey || e.metaKey) return;
    const { s, i } = current;
    const along = (from, by) => {
      for (let k2 = from + by; k2 >= 0 && k2 < n; k2 += by) if (val(s, k2) != null) return k2;
      return null;
    };
    const across = (by) => {
      for (let k2 = s + by; k2 >= 0 && k2 < series.length; k2 += by) if (val(k2, i) != null) return k2;
      return null;
    };
    const ahead = rtl ? -1 : 1;
    let k, to = null;
    switch (e.key) {
      case "ArrowRight":
        k = along(i, ahead);
        if (k != null) to = { s, i: k };
        break;
      case "ArrowLeft":
        k = along(i, -ahead);
        if (k != null) to = { s, i: k };
        break;
      case "ArrowDown":
        k = across(1);
        if (k != null) to = { s: k, i };
        break;
      case "ArrowUp":
        k = across(-1);
        if (k != null) to = { s: k, i };
        break;
      case "Home":
        k = along(-1, 1);
        if (k != null) to = { s, i: k };
        break;
      case "End":
        k = along(n, -1);
        if (k != null) to = { s, i: k };
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
  const onPointerMove = (e) => {
    if (!n) return;
    const x = flip(e.clientX - e.currentTarget.getBoundingClientRect().left);
    const i = type === "bar" ? Math.floor((x - start) / band) : n === 1 ? 0 : Math.round((x - start - INSET) * (n - 1) / Math.max(1, pw - 2 * INSET));
    const to = x >= start - INSET && i >= 0 && i < n ? i : null;
    if (to !== hover) {
      setHover(to);
      setHushed(false);
    }
  };
  const shown = hushed ? null : focus ? focus.i : hover;
  React.useEffect(() => {
    if (shown == null) return;
    const esc = (e) => {
      if (e.key === "Escape" && !isComposing(e)) {
        e.preventDefault();
        e.stopPropagation();
        setHushed(true);
      }
    };
    document.addEventListener("keydown", esc, true);
    return () => document.removeEventListener("keydown", esc, true);
  }, [shown]);
  const changeView = (v) => {
    if (props.view === void 0) setOwnView(v);
    props.onViewChange?.(v);
  };
  const group = band * (series.length > 1 ? 0.8 : 0.6), bw = group / Math.max(1, series.length);
  const zero = yAt(Math.min(Math.max(0, t0), tN));
  const bar = (s, i) => {
    const v = val(s, i);
    const x0 = start + band * (i + 0.5) - group / 2 + s * bw;
    const y1 = yAt(Math.max(v, 0)), y2 = yAt(Math.min(v, 0));
    return { x: rtl ? width - x0 - bw : x0, y: Math.min(y1, y2), w: bw, h: Math.max(1, Math.abs(y2 - y1)), neg: v < 0 };
  };
  const fill = (s) => s && series.length > 1 ? `url(#${base}-p${s})` : void 0;
  const tipRows = shown != null ? series.map((sr, s) => ({ s, name: sr.name, v: val(s, shown) })).filter((r) => r.v != null) : [];
  const tip = shown != null && tipRows.length ? { i: shown, x: xAt(shown), y: Math.min(...tipRows.map((r) => yAt(r.v))) } : null;
  useIsoLayoutEffect(() => {
    const el = tipRef.current;
    if (!el || !tip) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    const after = tip.x + 12, before = tip.x - 12 - w;
    const beside = after + w <= width ? after : before >= 0 ? before : null;
    const top = beside != null ? tip.y - h / 2 : tip.y - 12 - h >= 0 ? tip.y - 12 - h : tip.y + 12;
    el.style.left = (beside ?? Math.min(Math.max(0, tip.x - w / 2), Math.max(0, width - w))) + "px";
    el.style.top = (beside != null ? Math.min(Math.max(0, top), Math.max(0, height - h)) : top) + "px";
  });
  const order = Array.from({ length: n }, (_, i) => i);
  if (sort.dir !== "none") {
    const sign = sort.dir === "ascending" ? 1 : -1;
    order.sort((a, b) => {
      if (sort.col < 0) return (a - b) * sign;
      const va = val(sort.col, a), vb = val(sort.col, b);
      if (va == null || vb == null) return va == null ? vb == null ? a - b : 1 : -1;
      return (va - vb) * sign || a - b;
    });
  }
  const onSort = (col) => setSort((was) => ({ col, dir: was.col === col && was.dir === "ascending" ? "descending" : "ascending" }));
  const lineX = [flip(start), flip(width - PAD_END)].sort((a, b) => a - b);
  return /* @__PURE__ */ React.createElement(
    "figure",
    {
      ...rest,
      ref: nameRef,
      className: cn("dk-chart", "dk-chart--" + type, props.className),
      "data-component": "chart",
      "data-type": type,
      "data-view": view,
      "aria-labelledby": rest["aria-labelledby"] || (hasTitle && !rest["aria-label"] ? base + "-title" : void 0)
    },
    hasTitle ? /* @__PURE__ */ React.createElement("figcaption", { className: "dk-chart__title", id: base + "-title" }, props.title) : null,
    /* @__PURE__ */ React.createElement(Button, { className: "dk-chart__toggle", variant: "ghost", size: "sm", onClick: () => changeView(view === "chart" ? "table" : "chart") }, view === "chart" ? labels.chartShowTable : labels.chartShowChart),
    view === "table" ? /* @__PURE__ */ React.createElement(Table, { className: "dk-chart__table", size: "sm", caption: hasTitle ? props.title : rest["aria-label"], hideCaption: true }, /* @__PURE__ */ React.createElement(TableHead, null, /* @__PURE__ */ React.createElement(TableRow, null, /* @__PURE__ */ React.createElement(TableHeaderCell, { scope: "col", sort: sort.col === -1 ? sort.dir : "none", onSort: () => onSort(-1) }, props.categoryLabel || labels.chartCategory), series.map((sr, s) => /* @__PURE__ */ React.createElement(TableHeaderCell, { key: s, scope: "col", align: "end", sort: sort.col === s ? sort.dir : "none", onSort: () => onSort(s) }, sr.name)))), /* @__PURE__ */ React.createElement(TableBody, null, order.map((i) => /* @__PURE__ */ React.createElement(TableRow, { key: i }, /* @__PURE__ */ React.createElement(TableHeaderCell, { scope: "row" }, categories[i]), series.map((_, s) => {
      const v = val(s, i);
      return /* @__PURE__ */ React.createElement(TableCell, { key: s, align: "end" }, v == null ? labels.chartNoValue : fmt(v));
    }))))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "dk-chart__frame", ref: frame }, /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: "dk-chart__plot",
        width,
        height,
        viewBox: `0 0 ${width} ${height}`,
        role: "group",
        "aria-label": kind,
        "aria-describedby": base + "-summary",
        onKeyDown,
        onPointerMove,
        onPointerLeave: () => {
          setHover(null);
          setHushed(false);
        }
      },
      /* @__PURE__ */ React.createElement("desc", { id: base + "-summary" }, summary.join(" ")),
      type === "bar" && series.length > 1 ? /* @__PURE__ */ React.createElement("defs", null, series.map((_, s) => s ? /* @__PURE__ */ React.createElement(
        "pattern",
        {
          key: s,
          id: `${base}-p${s}`,
          className: "dk-chart__pattern dk-chart--s" + (s + 1),
          patternUnits: "userSpaceOnUse",
          width: "6",
          height: "6",
          patternTransform: s === 1 || s === 4 ? "rotate(45)" : s === 2 ? "rotate(-45)" : void 0
        },
        /* @__PURE__ */ React.createElement("rect", { className: "dk-chart__pattern-fill", width: "6", height: "6" }),
        s <= 3 ? /* @__PURE__ */ React.createElement("rect", { className: "dk-chart__pattern-mark", width: s === 3 ? 1.5 : 6, height: s === 3 ? 6 : 1.5, x: s === 3 ? 2.25 : 0, y: s === 3 ? 0 : 2.25 }) : s <= 5 ? /* @__PURE__ */ React.createElement("circle", { className: "dk-chart__pattern-mark", cx: "3", cy: "3", r: s === 4 ? 1.1 : 1.7 }) : /* @__PURE__ */ React.createElement("path", { className: "dk-chart__pattern-mark", d: s === 6 ? "M0 2.25H6V3.75H0ZM2.25 0H3.75V6H2.25Z" : "M0 0H3V3H0ZM3 3H6V6H3Z" })
      ) : null)) : null,
      /* @__PURE__ */ React.createElement("g", { className: "dk-chart__grid", "aria-hidden": true }, ticks.map((t, k) => /* @__PURE__ */ React.createElement("g", { key: k }, /* @__PURE__ */ React.createElement("line", { className: t === 0 && t0 < 0 ? "dk-chart__zero" : "dk-chart__gridline", x1: lineX[0], x2: lineX[1], y1: at(yAt(t)), y2: at(yAt(t)) }), /* @__PURE__ */ React.createElement("text", { className: "dk-chart__label", x: flip(start - 6), y: at(yAt(t)), dy: "0.32em", textAnchor: rtl ? "start" : "end" }, tickText[k])))),
      /* @__PURE__ */ React.createElement("g", { className: "dk-chart__axis", "aria-hidden": true }, /* @__PURE__ */ React.createElement("line", { className: "dk-chart__baseline", x1: lineX[0], x2: lineX[1], y1: at(type === "bar" ? zero : PAD_TOP + ph), y2: at(type === "bar" ? zero : PAD_TOP + ph) }), categories.map((c, i) => i % every ? null : /* @__PURE__ */ React.createElement("text", { key: i, className: "dk-chart__label", x: at(xAt(i)), y: PAD_TOP + ph + AXIS - 6, textAnchor: "middle" }, c))),
      shown != null ? /* @__PURE__ */ React.createElement("line", { className: "dk-chart__cursor", "aria-hidden": true, x1: at(xAt(shown)), x2: at(xAt(shown)), y1: PAD_TOP, y2: PAD_TOP + ph }) : null,
      series.map((sr, s) => {
        let d = "", open = false;
        for (let i = 0; i < n; i++) {
          const v = val(s, i);
          if (v == null) {
            open = false;
            continue;
          }
          d += `${open ? "L" : "M"}${at(xAt(i))} ${at(yAt(v))}`;
          open = true;
        }
        return /* @__PURE__ */ React.createElement("g", { key: s, className: "dk-chart__series dk-chart--s" + (s + 1), role: "group", "aria-label": series.length > 1 ? sr.name : void 0 }, type === "line" && d ? /* @__PURE__ */ React.createElement("path", { className: "dk-chart__line", d, pathLength: 1, "aria-hidden": true }) : null, Array.from({ length: n }, (_, i) => {
          const v = val(s, i);
          if (v == null) return null;
          const key = s + ":" + i;
          const common = {
            ref: (el) => {
              if (el) points.current.set(key, el);
              else points.current.delete(key);
            },
            role: "img",
            "aria-label": labels.chartPoint(series.length > 1 ? sr.name : null, categories[i], fmt(v)),
            tabIndex: current && current.s === s && current.i === i ? 0 : -1,
            "data-active": shown === i ? "" : void 0,
            onFocus: (e) => {
              setLast({ s, i });
              setHushed(false);
              setFocus({ s, i, ring: e.currentTarget.matches(":focus-visible") });
            },
            onBlur: () => setFocus(null)
          };
          if (type === "line") return /* @__PURE__ */ React.createElement("path", { key: i, ...common, className: "dk-chart__marker dk-chart__point", d: markerPath(s, xAt(i), yAt(v), MARKER) });
          const b = bar(s, i);
          return /* @__PURE__ */ React.createElement("rect", { key: i, ...common, className: cn("dk-chart__bar dk-chart__point", b.neg && "dk-chart__bar--neg"), x: at(b.x), y: at(b.y), width: at(b.w), height: at(b.h), fill: fill(s) });
        }));
      }),
      focus && focus.ring && val(focus.s, focus.i) != null ? (() => {
        if (type === "line") return /* @__PURE__ */ React.createElement("circle", { className: "dk-chart__focus", "aria-hidden": true, cx: at(xAt(focus.i)), cy: at(yAt(val(focus.s, focus.i))), r: MARKER + 5 });
        const b = bar(focus.s, focus.i);
        return /* @__PURE__ */ React.createElement("rect", { className: "dk-chart__focus", "aria-hidden": true, x: at(b.x - 3), y: at(b.y - 3), width: at(b.w + 6), height: at(b.h + 6), rx: "2" });
      })() : null
    ), tip ? /* @__PURE__ */ React.createElement("div", { ref: tipRef, className: "dk-chart__tip", "aria-hidden": true }, /* @__PURE__ */ React.createElement("div", { className: "dk-chart__tip-title" }, categories[tip.i]), tipRows.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.s, className: cn("dk-chart__tip-row", "dk-chart--s" + (r.s + 1), focus && focus.s === r.s && "dk-chart__tip-row--focus") }, /* @__PURE__ */ React.createElement("svg", { className: "dk-chart__swatch", width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": true, focusable: "false" }, type === "line" ? /* @__PURE__ */ React.createElement("path", { className: "dk-chart__marker", d: markerPath(r.s, 6, 6, MARKER) }) : /* @__PURE__ */ React.createElement("rect", { className: "dk-chart__bar", x: "1", y: "1", width: "10", height: "10", fill: fill(r.s) })), series.length > 1 ? /* @__PURE__ */ React.createElement("span", { className: "dk-chart__tip-name" }, r.name) : null, /* @__PURE__ */ React.createElement("span", { className: "dk-chart__tip-value" }, fmt(r.v))))) : null), !props.hideLegend && series.length ? /* @__PURE__ */ React.createElement("ul", { role: "list", className: "dk-chart__legend", "aria-hidden": true }, series.map((sr, s) => /* @__PURE__ */ React.createElement("li", { key: s, className: "dk-chart__key dk-chart--s" + (s + 1) }, /* @__PURE__ */ React.createElement("svg", { className: "dk-chart__swatch", width: "20", height: "12", viewBox: "0 0 20 12", "aria-hidden": true, focusable: "false" }, type === "line" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { className: "dk-chart__line", d: "M1 6H19" }), /* @__PURE__ */ React.createElement("path", { className: "dk-chart__marker", d: markerPath(s, 10, 6, MARKER) })) : /* @__PURE__ */ React.createElement("rect", { className: "dk-chart__bar", x: "3", y: "1", width: "14", height: "10", fill: fill(s) })), sr.name))) : null)
  );
});
export {
  Chart,
  markerPath,
  niceTicks
};
//# sourceMappingURL=Chart.js.map
