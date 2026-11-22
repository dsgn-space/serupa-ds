'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { Badge } from '../Badge/Badge';
import { Sparkline } from '../Sparkline/Sparkline';
import { Loader } from '../Loader/Loader';
import { en as words } from './labels';

/** How a number changed since the period before. */
export interface StatTileChange {
  /** The size of the change, already formatted: "12%" or "€1,200". */
  amount: string;
  /** Which way it went. The badge says "Up", "Down" or "No change" in words, with an arrow. */
  direction: 'up' | 'down' | 'flat';
  /** Whether this direction is good news: green when it is, red when it isn't. Default: up is good, down is bad. Pass false for a rise in costs. */
  good?: boolean | undefined;
}

export interface StatTileProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** What the number is, in a few words: "Revenue". Read first, before the value. */
  label: string;
  /** The number, already formatted for the page: "€48,200". */
  value: React.ReactNode;
  /** How it changed since the period before, said in words as well as color. */
  change?: StatTileChange | undefined;
  /** What the change compares with: "vs last month". Shown beside the change. */
  period?: string | undefined;
  /** The values over time, oldest first: a Sparkline under the number. Two or more, or none is drawn. */
  trend?: readonly number[] | undefined;
  /** The trend's name for screen readers, before its numbers. Default: the label and how many periods ("Revenue, last 8 periods"). */
  trendLabel?: string | undefined;
  /** How the trend's numbers read in its name: Intl.NumberFormat options ({ style: 'currency', currency: 'EUR' }). */
  trendFormat?: Intl.NumberFormatOptions | undefined;
  /** Shows a placeholder in place of the number while it loads, and marks the tile busy. Default: false. */
  loading?: boolean | undefined;
  /** What the placeholder says to screen readers. Default: "Loading…". Pass "" when one name covers several tiles. */
  loadingLabel?: string | undefined;
  /** The element: 'div' (default), 'li' in a list of tiles, or 'article'. */
  as?: 'div' | 'li' | 'article' | undefined;
}

const ARROW = { up: 'arrow_upward', down: 'arrow_downward', flat: 'remove' } as const;
const OWN = { label: 1, value: 1, change: 1, period: 1, trend: 1, trendLabel: 1, trendFormat: 1, loading: 1, loadingLabel: 1, as: 1, className: 1 } as const;

function StatTileRender({ ref, ...props }: StatTileProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, OWN);
  const sds = useSettings(words);
  const c = props.change;
  const direction = c && (c.direction === 'up' || c.direction === 'down') ? c.direction : 'flat';
  const good = c ? (c.good ?? direction === 'up') : false;
  const tone = direction === 'flat' ? 'neutral' : good ? 'success' : 'danger';
  const Tag = props.as === 'li' || props.as === 'article' ? props.as : 'div';
  const trend = props.trend && props.trend.length > 1 ? props.trend : null;
  return (
    <Tag {...rest} ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>} aria-busy={props.loading || undefined} className={cn('srp-stat-tile', props.className)} data-component="stat-tile">
      {props.loading ? <Loader variant="skeleton" shape="text" lines={3} label={props.loadingLabel} /> : <>
        <p className="srp-stat-tile__label">{props.label}</p>
        <p className="srp-stat-tile__value">{props.value}</p>
        {c ? (
          <p className="srp-stat-tile__change">
            <Badge tone={tone} startIcon={ARROW[direction]}>{direction === 'up' ? sds.labels.statTileUp(c.amount) : direction === 'down' ? sds.labels.statTileDown(c.amount) : sds.labels.statTileFlat}</Badge>
            {props.period ? <span>{props.period}</span> : null}
          </p>
        ) : null}
        {trend ? <Sparkline className="srp-stat-tile__trend" data={trend} format={props.trendFormat} label={props.trendLabel ?? sds.labels.statTileTrend(props.label, trend.length)} /> : null}
      </>}
    </Tag>
  );
}

/* StatTile: one key number on a card, for the top of a dashboard. It reads in order: what the number is, the number,
   how it changed (in words and with an arrow, not by color alone: "Up 12%"), and a trend line named by its numbers.
   Whether a change is good news is the app's call (change.good), so a rise in costs isn't shown in green.
   className and every other prop go to the tile's element. */
/** One key number on a card: its label, the value, how it changed in words, and an optional trend line.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const StatTile = /* @__PURE__ */ named('StatTile', StatTileRender);
