'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { displayNumber } from '../../internal/numbers';
import { useLocale, useSettings } from '../../internal/provider';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { isComposing } from '../../internal/ime';
import { SkeletonArt, useSkeletonShown } from '../../internal/loaderSkeleton';
import { useServerStyles } from '../../internal/serverStyles';
import { Button } from '../Button/Button';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type SortDirection } from '../Table/Table';
import { en as words } from './labels';

export type ChartType = 'line' | 'bar' | 'area' | 'donut';
export type ChartView = 'chart' | 'table';
export interface ChartSeries {
  /** The series' name: in the legend, the table's heading and each point's name. */
  name: string;
  /** One value per category, in the same order. null (or a missing one) leaves a gap: no point, no bar. */
  values: ReadonlyArray<number | null | undefined>;
}
export interface ChartProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** 'line' (default): a line per series with a marker at each point, for a change over time. 'bar': bars side by
      side in each category, for comparing amounts. 'area': a line with the space under it filled, stacked with
      `stacked`, for amounts over time that add up. 'donut': the first series' values as slices of a ring, for the
      shares of one whole; categories past the seventh go into one "Other" slice, so it keeps to the eight chart colors. */
  type?: ChartType | undefined;
  /** With type 'area': each series stands on the one before it, so the top line is the total. Default: false. */
  stacked?: boolean | undefined;
  /** A visible title above the chart, which also names it. Without one, give it an aria-label. */
  title?: React.ReactNode | undefined;
  /** The categories along the bottom, in order (months, regions, …): the labels of the points. */
  categories: ReadonlyArray<string>;
  /** Up to eight series, each with a value per category. Each gets a chart color (chart-1 to chart-8) and, so color
      isn't the only difference, its own marker shape (line) or pattern (bar), in the legend too. */
  series: ReadonlyArray<ChartSeries>;
  /** Turns a value into words, on the axis, in the tooltip, the table and what's read out: (value) => "Rp 1,2 jt".
      Default: the locale's number. */
  formatValue?: ((value: number) => string) | undefined;
  /** The heading of the categories' column in the table. Default: "Category" (labels.chartCategory). */
  categoryLabel?: string | undefined;
  /** The plot's height in pixels; the width is the box's. Default: 240. */
  height?: number | undefined;
  /** Hides the legend under the chart: with a single series, or when the title already names each one. Default: false. */
  hideLegend?: boolean | undefined;
  /** Shows the chart or the same numbers as a table, controlled. */
  view?: ChartView | undefined;
  /** The view it starts in, uncontrolled. Default: 'chart'. */
  defaultView?: ChartView | undefined;
  /** Called when the "Show as table" or "Show as chart" button is pressed, with the view it asks for. */
  onViewChange?: ((view: ChartView) => void) | undefined;
  /** The numbers are on their way: sets aria-busy. Before the first ones arrive (no categories yet), the plot is a
      placeholder at its height (the table button disabled, the legend's line kept), and `loadingLabel` is said once, after the loader's delay. With numbers already
      shown, they stay until the new ones arrive. Default: false. */
  busy?: boolean | undefined;
  /** Said once as the placeholder appears ("Loading visitors"). Default: "Loading…" (labels.loading). */
  loadingLabel?: string | undefined;
}

const OWN = { type: 1, stacked: 1, title: 1, categories: 1, series: 1, formatValue: 1, categoryLabel: 1, height: 1, hideLegend: 1, view: 1, defaultView: 1, onViewChange: 1, busy: 1, loadingLabel: 1, className: 1 } as const;
const TYPES = ['line', 'bar', 'area', 'donut'] as const;
const VIEWS = ['chart', 'table'] as const;
const COLORS = 8;
// The plot's frame in pixels, and a label's character width (text-xs) for laying out axis labels without measuring.
const CHAR = 7.2, PAD_TOP = 8, PAD_END = 8, AXIS = 24, INSET = 10, MARKER = 4;
const WIDTH = 640;   // before the box is measured: the server render and the first frame

// Stands in for the plot until the first numbers arrive: a block as tall as the plot, so nothing jumps.
function ChartPlaceholder({ height, label }: { height: number; label: string }) {
  const shown = useSkeletonShown(label);
  const ref = useServerStyles<HTMLDivElement>();   // the height holds under a strict CSP too
  return <div ref={ref} className="dk-chart__placeholder" style={{ blockSize: height }}><SkeletonArt shape="rect" waiting={!shown} /></div>;
}

/** Round ticks from lo to hi, about count of them, in steps of 1, 2, 2.5 or 5 times a power of ten. */
export function niceTicks(lo: number, hi: number, count: number): number[] {
  if (!(hi > lo)) { if (lo > 0) lo = 0; else if (lo < 0) hi = 0; else hi = 1; }
  const raw = (hi - lo) / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw * (1 - 1e-9)) ?? 10 * mag;
  const out: number[] = [];
  for (let v = Math.floor(lo / step + 1e-9) * step; v < hi + step * (1 - 1e-9); v += step) out.push(+v.toPrecision(12));
  const end = out[out.length - 1] ?? lo;
  if (end < hi - 1e-9 * step) out.push(+(end + step).toPrecision(12));
  return out;
}

// The marker shapes, one per series, so a line is told apart by its shape as well as its color (WCAG 1.4.1).
const at = (n: number) => +n.toFixed(2);
const poly = (cx: number, cy: number, pts: Array<[number, number]>) => 'M' + pts.map(([x, y]) => `${at(cx + x)} ${at(cy + y)}`).join('L') + 'Z';
const around = (k: number, r: number, turn = -90): Array<[number, number]> => Array.from({ length: k }, (_, i) => { const a = ((turn + (360 / k) * i) * Math.PI) / 180; return [r * Math.cos(a), r * Math.sin(a)]; });
/** The SVG path of series shape's marker at (cx, cy), r across: circle, square, triangle, diamond, triangle down, hexagon, star, plus. */
export function markerPath(shape: number, cx: number, cy: number, r: number): string {
  switch (shape % COLORS) {
    case 0: return `M${at(cx - r)} ${at(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
    case 1: return poly(cx, cy, around(4, r * 1.25, 45));
    case 2: return poly(cx, cy, around(3, r * 1.4));
    case 3: return poly(cx, cy, around(4, r * 1.35));
    case 4: return poly(cx, cy, around(3, r * 1.4, 90));
    case 5: return poly(cx, cy, around(6, r * 1.15));
    case 6: return poly(cx, cy, around(10, r * 1.5).map(([x, y], i): [number, number] => (i % 2 ? [x * 0.5, y * 0.5] : [x, y])));
    default: { const a = r * 0.45, b = r * 1.25; return poly(cx, cy, [[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]); }
  }
}

interface Point { s: number; i: number; v: number }
type Spot = { s: number; i: number };
type Focused = Spot & { ring: boolean };

/** A line, bar or area chart of a few series over the same categories, or a donut of one series' shares, drawn as SVG, with a summary, keyboard focus on each point and the same numbers as a table.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Chart = /* @__PURE__ */ component<HTMLElement, ChartProps>('Chart', function Chart(props, ref) {
  const nameRef = useNameCheck<HTMLElement>('Chart', NAME_HOW.title, ref);
  const rest = omit(props, OWN);
  const locale = useLocale();
  const labels = useSettings(words).labels;
  const busy = !!props.busy;
  const base = domId('dk-chart', React.useId());
  const type = oneOf(TYPES, props.type, 'line');
  const categories = props.categories || [];
  const series = (props.series || []).slice(0, COLORS);
  const n = categories.length;
  const waiting = busy && !n;   // nothing to draw yet: the placeholder
  const height = Math.max(80, Math.round(Number(props.height) || 240));
  const fmt = (v: number) => (props.formatValue ? props.formatValue(v) : displayNumber(v, locale));
  const [ownView, setOwnView] = React.useState<ChartView>(() => oneOf(VIEWS, props.defaultView, 'chart'));
  const view = oneOf(VIEWS, props.view, ownView);
  const [width, setWidth] = React.useState(WIDTH);
  const [rtl, setRtl] = React.useState(false);
  const [hover, setHover] = React.useState<number | null>(null);
  // Escape hid the tip (WCAG 1.4.13): it stays hidden until another point or category is shown (GR156).
  const [hushed, setHushed] = React.useState(false);
  const [focus, setFocus] = React.useState<Focused | null>(null);
  const [last, setLast] = React.useState<Spot | null>(null);
  const [sort, setSort] = React.useState<{ col: number; dir: SortDirection }>({ col: -1, dir: 'none' });
  const frame = React.useRef<HTMLDivElement>(null);
  const tipRef = React.useRef<HTMLDivElement>(null);
  const points = React.useRef(new Map<string, SVGElement>());
  const hasTitle = props.title != null && props.title !== false && props.title !== '';

  // The width is the box's, measured before the first paint and again when it changes; the direction is the page's.
  useIsoLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setWidth(w);
      setRtl(getComputedStyle(el).direction === 'rtl');
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [view]);

  const val = (s: number, i: number): number | null => { const v = series[s]?.values[i]; return typeof v === 'number' && isFinite(v) ? v : null; };
  const all: Point[] = [];
  series.forEach((_, s) => { for (let i = 0; i < n; i++) { const v = val(s, i); if (v != null) all.push({ s, i, v }); } });
  // Lines and areas share their layout: a point per category, from edge to edge.
  const linear = type === 'line' || type === 'area';
  const stacked = type === 'area' && !!props.stacked && series.length > 1;
  // Stacked, a series' line is the sum of its value and those of the series before it (a missing one counts as 0).
  const topOf = (s: number, i: number) => { let t = 0; for (let k = 0; k <= s; k++) t += val(k, i) ?? 0; return t; };
  const heights = all.map((p) => (stacked ? topOf(p.s, p.i) : p.v));
  let lo = heights.length ? Math.min(...heights) : 0, hi = heights.length ? Math.max(...heights) : 1;
  // Bars and areas stand on zero. A line starts at zero too, unless its values sit so far from it that zero would
  // flatten them.
  const onZero = type === 'bar' || type === 'area';
  if (onZero || (lo >= 0 && lo <= hi / 2)) lo = Math.min(lo, 0);
  if (onZero || (hi <= 0 && hi >= lo / 2)) hi = Math.max(hi, 0);
  const ticks = niceTicks(lo, hi, Math.max(2, Math.floor((height - PAD_TOP - AXIS) / 48)));
  const t0 = ticks[0] ?? lo, tN = ticks[ticks.length - 1] ?? hi;
  const tickText = ticks.map(fmt);
  const start = Math.ceil(Math.max(...tickText.map((t) => t.length)) * CHAR) + 10;
  const pw = Math.max(1, width - start - PAD_END), ph = Math.max(1, height - PAD_TOP - AXIS);
  const band = pw / Math.max(1, n);
  // x from the start edge, mirrored on a right-to-left page so the first category is on the right.
  const flip = (x: number) => (rtl ? width - x : x);
  const xAt = (i: number) => flip(type === 'bar' ? start + band * (i + 0.5) : n === 1 ? start + pw / 2 : start + INSET + (i * (pw - 2 * INSET)) / (n - 1));
  const yAt = (v: number) => PAD_TOP + ph * (1 - (v - t0) / (tN - t0 || 1));
  // A point's height: its value, or stacked, its series' line there.
  const py = (s: number, i: number) => yAt(stacked ? topOf(s, i) : val(s, i)!);
  const step = type === 'bar' ? band : n > 1 ? (pw - 2 * INSET) / (n - 1) : pw;
  // Every category gets a label when they fit side by side; else every second, third…, from the first.
  const every = Math.max(1, Math.ceil((Math.max(1, ...categories.map((c) => c.length)) * CHAR + 8) / Math.max(1, step)));

  // A donut's slices: the first series' values above zero, in order; past the seventh, the rest are one "Other".
  const donut = type === 'donut';
  const positive = donut ? categories.map((name, i) => ({ name, v: val(0, i) ?? 0 })).filter((x) => x.v > 0) : [];
  const slices = positive.length > COLORS ? [...positive.slice(0, COLORS - 1), { name: labels.chartOther, v: positive.slice(COLORS - 1).reduce((a, b) => a + b.v, 0) }] : positive;
  const total = slices.reduce((a, b) => a + b.v, 0);
  const share = (v: number) => labels.chartShare(fmt(v), displayNumber(v / total, locale, { style: 'percent', maximumFractionDigits: v / total < 0.1 ? 1 : 0 }));

  const kind = labels.chartKind(type);
  const summary = donut
    ? [labels.chartSummary(kind, slices.length ? 1 : 0, slices.length, slices[0]?.name ?? '', slices[slices.length - 1]?.name ?? '')]
    : [labels.chartSummary(kind, series.length, n, categories[0] ?? '', categories[n - 1] ?? '')];
  if (donut && slices.length) {
    const min = slices.reduce((a, b) => (b.v < a.v ? b : a)), max = slices.reduce((a, b) => (b.v > a.v ? b : a));
    summary.push(labels.chartTotal(fmt(total)), labels.chartRange(series[0]?.name ?? '', share(min.v), min.name, share(max.v), max.name));
  }
  if (!donut) series.forEach((sr, s) => {
    const mine = all.filter((p) => p.s === s);
    if (!mine.length) return;
    const min = mine.reduce((a, b) => (b.v < a.v ? b : a)), max = mine.reduce((a, b) => (b.v > a.v ? b : a));
    summary.push(labels.chartRange(sr.name, fmt(min.v), categories[min.i] ?? '', fmt(max.v), categories[max.i] ?? ''));
  });

  // One point is in the tab order: the one focused last, else the first with a value.
  const current: Spot | null = donut
    ? (slices.length ? { s: 0, i: last && last.i < slices.length ? last.i : 0 } : null)
    : last && val(last.s, last.i) != null ? last : all[0] ? { s: all[0].s, i: all[0].i } : null;
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!current || e.altKey || e.ctrlKey || e.metaKey) return;
    const { s, i } = current;
    if (donut) {
      // Around the ring: Right or Down to the next slice, Left or Up to the one before (Left and Right swap in right to left).
      const k = e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? i + 1 : e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? i - 1
        : e.key === 'Home' ? 0 : e.key === 'End' ? slices.length - 1 : null;
      if (k == null) return;
      e.preventDefault();
      if (k >= 0 && k < slices.length) { setLast({ s: 0, i: k }); points.current.get('0:' + k)?.focus(); }
      return;
    }
    const along = (from: number, by: number) => { for (let k = from + by; k >= 0 && k < n; k += by) if (val(s, k) != null) return k; return null; };
    const across = (by: number) => { for (let k = s + by; k >= 0 && k < series.length; k += by) if (val(k, i) != null) return k; return null; };
    const ahead = rtl ? -1 : 1;
    let k: number | null, to: Spot | null = null;
    switch (e.key) {
      case 'ArrowRight': k = along(i, ahead); if (k != null) to = { s, i: k }; break;
      case 'ArrowLeft': k = along(i, -ahead); if (k != null) to = { s, i: k }; break;
      case 'ArrowDown': k = across(1); if (k != null) to = { s: k, i }; break;
      case 'ArrowUp': k = across(-1); if (k != null) to = { s: k, i }; break;
      case 'Home': k = along(-1, 1); if (k != null) to = { s, i: k }; break;
      case 'End': k = along(n, -1); if (k != null) to = { s, i: k }; break;
      default: return;
    }
    e.preventDefault();
    if (to) { setLast(to); points.current.get(to.s + ':' + to.i)?.focus(); }
  };
  // The category under the pointer: the nearest point (line) or the band it's in (bar).
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!n || donut) return;   // a donut's slices say when the pointer is on them
    const x = flip(e.clientX - e.currentTarget.getBoundingClientRect().left);
    const i = type === 'bar' ? Math.floor((x - start) / band) : n === 1 ? 0 : Math.round(((x - start - INSET) * (n - 1)) / Math.max(1, pw - 2 * INSET));
    const to = x >= start - INSET && i >= 0 && i < n ? i : null;
    if (to !== hover) { setHover(to); setHushed(false); }
  };
  const shown = hushed ? null : focus ? focus.i : hover;
  // Escape hides the tip from anywhere while it shows (the plot may only be hovered, not focused), and focus stays.
  // Caught first and stopped, as Tooltip does, so a Dialog around the chart stays open.
  React.useEffect(() => {
    if (shown == null) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isComposing(e)) { e.preventDefault(); e.stopPropagation(); setHushed(true); } };
    document.addEventListener('keydown', esc, true);
    return () => document.removeEventListener('keydown', esc, true);
  }, [shown]);
  const changeView = (v: ChartView) => { if (props.view === undefined) setOwnView(v); props.onViewChange?.(v); };

  // Bars: a category's group takes most of its band, a bar per series, the chart-gap color between them.
  const group = band * (series.length > 1 ? 0.8 : 0.6), bw = group / Math.max(1, series.length);
  const zero = yAt(Math.min(Math.max(0, t0), tN));
  const bar = (s: number, i: number) => {
    const v = val(s, i)!;
    const x0 = start + band * (i + 0.5) - group / 2 + s * bw;
    const y1 = yAt(Math.max(v, 0)), y2 = yAt(Math.min(v, 0));
    return { x: rtl ? width - x0 - bw : x0, y: Math.min(y1, y2), w: bw, h: Math.max(1, Math.abs(y2 - y1)), neg: v < 0 };
  };
  const fill = (s: number, count = series.length) => (s && count > 1 ? `url(#${base}-p${s})` : undefined);
  // An area: from its line down to zero, or stacked, down to the series under it; a missing value breaks it (unstacked).
  const areaPath = (s: number) => {
    let d = '';
    for (let i = 0; i < n; ) {
      if (!stacked && val(s, i) == null) { i++; continue; }
      let j = i;
      while (j + 1 < n && (stacked || val(s, j + 1) != null)) j++;
      const top: string[] = [], bottom: string[] = [];
      for (let k = i; k <= j; k++) {
        top.push(`${at(xAt(k))} ${at(stacked ? yAt(topOf(s, k)) : yAt(val(s, k)!))}`);
        bottom.push(`${at(xAt(k))} ${at(stacked && s ? yAt(topOf(s - 1, k)) : zero)}`);
      }
      d += 'M' + top.join('L') + 'L' + bottom.reverse().join('L') + 'Z';
      i = j + 1;
    }
    return d;
  };

  // The ring: centered, as big as the box allows, a slice per share clockwise from the top (mirrored in right to left).
  const cx = width / 2, cy = height / 2, R = Math.max(12, Math.min(width, height) / 2 - 6), IN = R * 0.62;
  const angles = slices.reduce<number[]>((a, sl) => [...a, (a[a.length - 1] ?? 0) + (2 * Math.PI * sl.v) / (total || 1)], [-Math.PI / 2]);
  // Slice k runs from angle(k) to angle(k + 1).
  const angle = (k: number) => angles[k] ?? 0;
  const ring = (a0: number, a1: number, r0: number, r1: number) => {
    const p = (a: number, r: number) => `${at(cx + r * Math.cos(a))} ${at(cy + r * Math.sin(a))}`;
    if (a1 - a0 >= 2 * Math.PI - 1e-6) return `M${p(-Math.PI / 2, r1)}A${at(r1)} ${at(r1)} 0 1 1 ${p(Math.PI / 2, r1)}A${at(r1)} ${at(r1)} 0 1 1 ${p(-Math.PI / 2, r1)}ZM${p(-Math.PI / 2, r0)}A${at(r0)} ${at(r0)} 0 1 0 ${p(Math.PI / 2, r0)}A${at(r0)} ${at(r0)} 0 1 0 ${p(-Math.PI / 2, r0)}Z`;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    return `M${p(a0, r1)}A${at(r1)} ${at(r1)} 0 ${big} 1 ${p(a1, r1)}L${p(a1, r0)}A${at(r0)} ${at(r0)} 0 ${big} 0 ${p(a0, r0)}Z`;
  };

  const tipRows = shown == null ? []
    : donut ? (slices[shown] ? [{ s: shown, name: '', text: share(slices[shown].v) }] : [])
      : series.map((sr, s) => ({ s, name: sr.name, v: val(s, shown) })).filter((r) => r.v != null).map((r) => ({ s: r.s, name: r.name, text: fmt(r.v!) }));
  const mid = donut && shown != null ? (angle(shown) + angle(shown + 1)) / 2 : 0;
  const tip = shown == null || !tipRows.length ? null
    : donut ? { i: shown, title: slices[shown]?.name, x: flip(cx + R * Math.cos(mid)), y: cy + R * Math.sin(mid) }
      : { i: shown, title: categories[shown], x: xAt(shown), y: Math.min(...tipRows.map((r) => py(r.s, shown))) };
  // Beside the category, on the other side near the edge, inside the frame: set through the CSSOM, which a strict
  // style-src allows.
  // every render: the tip's size follows its words, which change with the category, the series and the format.
  useIsoLayoutEffect(() => {
    const el = tipRef.current;
    if (!el || !tip) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    // Physical left, as the points' x is: the CSS sets no inline side, so nothing stretches it in right to left (GR145).
    // Beside the point when one side has room, else centered on it and above it, or below when the top is too near (GR146).
    const after = tip.x + 12, before = tip.x - 12 - w;
    const beside = after + w <= width ? after : before >= 0 ? before : null;
    const top = beside != null ? tip.y - h / 2 : tip.y - 12 - h >= 0 ? tip.y - 12 - h : tip.y + 12;
    el.style.left = (beside ?? Math.min(Math.max(0, tip.x - w / 2), Math.max(0, width - w))) + 'px';
    el.style.top = (beside != null ? Math.min(Math.max(0, top), Math.max(0, height - h)) : top) + 'px';
  });

  const order = Array.from({ length: n }, (_, i) => i);
  if (sort.dir !== 'none') {
    const sign = sort.dir === 'ascending' ? 1 : -1;
    order.sort((a, b) => {
      if (sort.col < 0) return (a - b) * sign;
      const va = val(sort.col, a), vb = val(sort.col, b);
      if (va == null || vb == null) return va == null ? (vb == null ? a - b : 1) : -1;   // missing values go last
      return (va - vb) * sign || a - b;
    });
  }
  const onSort = (col: number) => setSort((was) => ({ col, dir: was.col === col && was.dir === 'ascending' ? 'descending' : 'ascending' }));
  const lineX = [flip(start), flip(width - PAD_END)].sort((a, b) => a - b);

  return (
    <figure {...rest} ref={nameRef} className={cn('dk-chart', 'dk-chart--' + type, props.className)} data-component="chart" data-type={type} data-view={view}
      aria-busy={rest['aria-busy'] ?? (busy || undefined)}
      aria-labelledby={rest['aria-labelledby'] || (hasTitle && !rest['aria-label'] ? base + '-title' : undefined)}>
      {hasTitle ? <figcaption className="dk-chart__title" id={base + '-title'}>{props.title}</figcaption> : null}
      {/* While the first numbers load, the toggle and the legend's line are there already (the toggle disabled, the line
          empty), so nothing below moves when the chart arrives. */}
      <Button className="dk-chart__toggle" variant="ghost" size="sm" disabled={waiting || undefined} onClick={() => changeView(view === 'chart' ? 'table' : 'chart')}>
        {view === 'chart' ? labels.chartShowTable : labels.chartShowChart}
      </Button>
      {waiting ? (
        <>
          <div className="dk-chart__frame" ref={frame}><ChartPlaceholder height={height} label={props.loadingLabel || labels.loading} /></div>
          {props.hideLegend ? null : <div className="dk-chart__legend dk-chart__legend--waiting" aria-hidden />}
        </>
      ) : view === 'table' ? (
        <Table className="dk-chart__table" size="sm" caption={hasTitle ? props.title : rest['aria-label']} hideCaption>
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col" sort={sort.col === -1 ? sort.dir : 'none'} onSort={() => onSort(-1)}>{props.categoryLabel || labels.chartCategory}</TableHeaderCell>
              {series.map((sr, s) => <TableHeaderCell key={s} scope="col" align="end" sort={sort.col === s ? sort.dir : 'none'} onSort={() => onSort(s)}>{sr.name}</TableHeaderCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {order.map((i) => (
              <TableRow key={i}>
                <TableHeaderCell scope="row">{categories[i]}</TableHeaderCell>
                {series.map((_, s) => { const v = val(s, i); return <TableCell key={s} align="end">{v == null ? labels.chartNoValue : fmt(v)}</TableCell>; })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <>
          <div className="dk-chart__frame" ref={frame}>
            <svg className="dk-chart__plot" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={kind}
              aria-describedby={base + '-summary'} onKeyDown={onKeyDown} onPointerMove={onPointerMove} onPointerLeave={() => { setHover(null); setHushed(false); }}>
              <desc id={base + '-summary'}>{summary.join(' ')}</desc>
              {(type === 'bar' && series.length > 1) || (donut && slices.length > 1) ? (
                <defs>
                  {Array.from({ length: donut ? slices.length : series.length }, (_, s) => (s ? (
                    <pattern key={s} id={`${base}-p${s}`} className={'dk-chart__pattern dk-chart--s' + (s + 1)} patternUnits="userSpaceOnUse" width="6" height="6"
                      patternTransform={s === 1 || s === 4 ? 'rotate(45)' : s === 2 ? 'rotate(-45)' : undefined}>
                      <rect className="dk-chart__pattern-fill" width="6" height="6" />
                      {s <= 3 ? <rect className="dk-chart__pattern-mark" width={s === 3 ? 1.5 : 6} height={s === 3 ? 6 : 1.5} x={s === 3 ? 2.25 : 0} y={s === 3 ? 0 : 2.25} />
                        : s <= 5 ? <circle className="dk-chart__pattern-mark" cx="3" cy="3" r={s === 4 ? 1.1 : 1.7} />
                        : <path className="dk-chart__pattern-mark" d={s === 6 ? 'M0 2.25H6V3.75H0ZM2.25 0H3.75V6H2.25Z' : 'M0 0H3V3H0ZM3 3H6V6H3Z'} />}
                    </pattern>
                  ) : null))}
                </defs>
              ) : null}
              {donut ? (
                <>
                  <g transform={rtl ? `matrix(-1 0 0 1 ${width} 0)` : undefined}>
                    {slices.map((sl, k) => (
                      <path key={k} ref={(el) => { if (el) points.current.set('0:' + k, el); else points.current.delete('0:' + k); }}
                        role="img" aria-label={labels.chartPoint(null, sl.name, share(sl.v))} tabIndex={current && current.i === k ? 0 : -1}
                        className={'dk-chart__slice dk-chart__point dk-chart--s' + (k + 1)} d={ring(angle(k), angle(k + 1), IN, R)} fill={fill(k, slices.length)}
                        fillRule="evenodd" data-active={shown === k ? '' : undefined}
                        onPointerEnter={() => { if (k !== hover) { setHover(k); setHushed(false); } }}
                        onFocus={(e) => { setLast({ s: 0, i: k }); setHushed(false); setFocus({ s: 0, i: k, ring: e.currentTarget.matches(':focus-visible') }); }}
                        onBlur={() => setFocus(null)} />
                    ))}
                    {focus && focus.ring && slices[focus.i] ? <path className="dk-chart__focus" aria-hidden fillRule="evenodd" d={ring(angle(focus.i), angle(focus.i + 1), IN - 3, R + 3)} /> : null}
                  </g>
                  {slices.length ? <text className="dk-chart__total" aria-hidden x={at(cx)} y={at(cy)} dy="0.32em" textAnchor="middle">{labels.chartTotal(fmt(total))}</text> : null}
                </>
              ) : (<>
              <g className="dk-chart__grid" aria-hidden>
                {ticks.map((t, k) => (
                  <g key={k}>
                    <line className={t === 0 && t0 < 0 ? 'dk-chart__zero' : 'dk-chart__gridline'} x1={lineX[0]} x2={lineX[1]} y1={at(yAt(t))} y2={at(yAt(t))} />
                    <text className="dk-chart__label" x={flip(start - 6)} y={at(yAt(t))} dy="0.32em" textAnchor={rtl ? 'start' : 'end'}>{tickText[k]}</text>
                  </g>
                ))}
              </g>
              <g className="dk-chart__axis" aria-hidden>
                <line className="dk-chart__baseline" x1={lineX[0]} x2={lineX[1]} y1={at(type === 'bar' ? zero : PAD_TOP + ph)} y2={at(type === 'bar' ? zero : PAD_TOP + ph)} />
                {categories.map((c, i) => (i % every ? null : <text key={i} className="dk-chart__label" x={at(xAt(i))} y={PAD_TOP + ph + AXIS - 6} textAnchor="middle">{c}</text>))}
              </g>
              {type === 'area' ? (
                <g aria-hidden>
                  {series.map((_, s) => <path key={s} className={'dk-chart__area dk-chart--s' + (s + 1)} d={areaPath(s)} />)}
                </g>
              ) : null}
              {shown != null ? <line className="dk-chart__cursor" aria-hidden x1={at(xAt(shown))} x2={at(xAt(shown))} y1={PAD_TOP} y2={PAD_TOP + ph} /> : null}
              {series.map((sr, s) => {
                let d = '', open = false;
                for (let i = 0; i < n; i++) {
                  const v = val(s, i);
                  if (v == null) { open = false; continue; }
                  d += `${open ? 'L' : 'M'}${at(xAt(i))} ${at(py(s, i))}`;
                  open = true;
                }
                return (
                  <g key={s} className={'dk-chart__series dk-chart--s' + (s + 1)} role="group" aria-label={series.length > 1 ? sr.name : undefined}>
                    {linear && d ? <path className="dk-chart__line" d={d} pathLength={1} aria-hidden /> : null}
                    {Array.from({ length: n }, (_, i) => {
                      const v = val(s, i);
                      if (v == null) return null;
                      const key = s + ':' + i;
                      const common = {
                        ref: (el: SVGElement | null) => { if (el) points.current.set(key, el); else points.current.delete(key); },
                        role: 'img',
                        'aria-label': labels.chartPoint(series.length > 1 ? sr.name : null, categories[i] ?? '', fmt(v)),
                        tabIndex: current && current.s === s && current.i === i ? 0 : -1,
                        'data-active': shown === i ? '' : undefined,
                        onFocus: (e: React.FocusEvent<SVGElement>) => { setLast({ s, i }); setHushed(false); setFocus({ s, i, ring: e.currentTarget.matches(':focus-visible') }); },
                        onBlur: () => setFocus(null),
                      };
                      if (linear) return <path key={i} {...common} className="dk-chart__marker dk-chart__point" d={markerPath(s, xAt(i), py(s, i), MARKER)} />;
                      const b = bar(s, i);
                      return <rect key={i} {...common} className={cn('dk-chart__bar dk-chart__point', b.neg && 'dk-chart__bar--neg')} x={at(b.x)} y={at(b.y)} width={at(b.w)} height={at(b.h)} fill={fill(s)} />;
                    })}
                  </g>
                );
              })}
              {focus && focus.ring && val(focus.s, focus.i) != null ? (() => {
                // The focus ring, a gap away from the point so it shows against the series' own color.
                if (linear) return <circle className="dk-chart__focus" aria-hidden cx={at(xAt(focus.i))} cy={at(py(focus.s, focus.i))} r={MARKER + 5} />;
                const b = bar(focus.s, focus.i);
                return <rect className="dk-chart__focus" aria-hidden x={at(b.x - 3)} y={at(b.y - 3)} width={at(b.w + 6)} height={at(b.h + 6)} rx="2" />;
              })() : null}
              </>)}
            </svg>
            {tip ? (
              <div ref={tipRef} className="dk-chart__tip" aria-hidden>
                <div className="dk-chart__tip-title">{tip.title}</div>
                {tipRows.map((r) => (
                  <div key={r.s} className={cn('dk-chart__tip-row', 'dk-chart--s' + (r.s + 1), focus && focus.s === r.s && 'dk-chart__tip-row--focus')}>
                    <svg className="dk-chart__swatch" width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
                      {linear ? <path className="dk-chart__marker" d={markerPath(r.s, 6, 6, MARKER)} /> : <rect className="dk-chart__bar" x="1" y="1" width="10" height="10" fill={fill(r.s, donut ? slices.length : series.length)} />}
                    </svg>
                    {series.length > 1 && !donut ? <span className="dk-chart__tip-name">{r.name}</span> : null}
                    <span className="dk-chart__tip-value">{r.text}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {!props.hideLegend && donut && slices.length ? (
            // A donut's legend names each slice with its share, so the slices are told apart in words, not by color alone.
            <ul role="list" className="dk-chart__legend" aria-hidden>
              {slices.map((sl, k) => (
                <li key={k} className={'dk-chart__key dk-chart--s' + (k + 1)}>
                  <svg className="dk-chart__swatch" width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
                    <rect className="dk-chart__bar" x="1" y="1" width="10" height="10" fill={fill(k, slices.length)} />
                  </svg>
                  {sl.name}<span className="dk-chart__key-value">{share(sl.v)}</span>
                </li>
              ))}
            </ul>
          ) : !props.hideLegend && series.length && !donut ? (
            <ul role="list" className="dk-chart__legend" aria-hidden>
              {series.map((sr, s) => (
                <li key={s} className={'dk-chart__key dk-chart--s' + (s + 1)}>
                  <svg className="dk-chart__swatch" width="20" height="12" viewBox="0 0 20 12" aria-hidden focusable="false">
                    {linear
                      ? <><path className="dk-chart__line" d="M1 6H19" /><path className="dk-chart__marker" d={markerPath(s, 10, 6, MARKER)} /></>
                      : <rect className="dk-chart__bar" x="3" y="1" width="14" height="10" fill={fill(s)} />}
                  </svg>
                  {sr.name}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </figure>
  );
});
