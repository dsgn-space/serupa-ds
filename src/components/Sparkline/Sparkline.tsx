'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { en as words } from './labels';

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'min' | 'max' | 'format' | 'name'> {
  /** The numbers, oldest first. Anything that isn't a finite number is left out. */
  data: readonly number[];
  /** What it measures, in a few words ("Revenue, last 12 weeks"). Screen readers hear it before the numbers. */
  label: string;
  /** How the numbers read in the summary: Intl.NumberFormat options ({ style: 'currency', currency: 'EUR' }). */
  format?: Intl.NumberFormatOptions | undefined;
  /** Fills the space under the line. Default: false. */
  area?: boolean | undefined;
  /** The bottom of the scale. Default: the lowest number. Set min and max to compare several sparklines on one scale. */
  min?: number | undefined;
  /** The top of the scale. Default: the highest number. */
  max?: number | undefined;
}

// The drawing's grid: 100 wide and 30 high, stretched to the box (preserveAspectRatio none); the strokes keep their
// width with non-scaling-stroke. PAD keeps the line and the end dot inside the box at the top and the bottom.
const W = 100, H = 30, PAD = 4;
const at = (x: number) => Math.round(x * 100) / 100;

/* Sparkline: a small trend line that sits in a sentence, a table cell or a stat card, with a dot on the latest value.
   It's an image to screen readers, named by label and a summary of the numbers (first, last, low, high), since the
   shape alone doesn't say them. No axes, no tooltip: when the numbers matter, show them as well. className and every
   other prop go to the <svg>. */
/** A small inline trend line, named for screen readers by what it measures and its first, last, low and high values.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Sparkline = /* @__PURE__ */ component<SVGSVGElement, SparklineProps>('Sparkline', function Sparkline(props, ref) {
  const rest = omit(props, { data: 1, label: 1, format: 1, area: 1, min: 1, max: 1, className: 1 });
  const sds = useSettings(words), locale = useLocale();
  const data = (props.data || []).filter((v) => typeof v === 'number' && isFinite(v));
  const low = Math.min(...data), high = Math.max(...data);
  const lo = typeof props.min === 'number' && isFinite(props.min) ? props.min : low;
  const hi = typeof props.max === 'number' && isFinite(props.max) ? props.max : high;
  const x = (i: number) => at(data.length > 1 ? (i / (data.length - 1)) * W : W / 2);
  const y = (v: number) => at(hi > lo ? PAD + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * (H - 2 * PAD) : H / 2);
  const line = data.map((v, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(v)).join('');
  const last = data.length - 1;
  const fmt = (v: number) => displayNumber(v, locale, props.format);
  const name = data.length ? sds.labels.sparklineSummary(props.label, fmt(data[0]), fmt(data[last]), fmt(low), fmt(high)) : props.label;
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="none" width="2em" height="0.5em" role="img" aria-label={name} focusable="false" {...rest} ref={ref} className={cn('dk-sparkline', props.className)} data-component="sparkline">
      {props.area && data.length > 1 ? <path className="dk-sparkline__area" d={line + 'L' + W + ' ' + H + 'L0 ' + H + 'Z'} /> : null}
      {data.length > 1 ? <path className="dk-sparkline__line" d={line} vectorEffect="non-scaling-stroke" /> : null}
      {data.length ? <path className="dk-sparkline__dot" d={'M' + x(last) + ' ' + y(data[last]) + 'Z'} vectorEffect="non-scaling-stroke" /> : null}
    </svg>
  );
});
