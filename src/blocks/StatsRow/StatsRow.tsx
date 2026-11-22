'use client';
import * as React from 'react';
import { Heading } from '../../components/Heading/Heading';
import { StatTile } from '../../components/StatTile/StatTile';
import { SerupaProvider } from '../../internal/provider';
import { EmptyLoadFailed } from '../EmptyStates/EmptyStates';

/* Stats row (BL2): a row of key numbers for the top of a dashboard, built from the components only, for an app to copy.
   Each number is a StatTile, which says its change in words and names its trend line.
   What it carries (WCAG 2.2):
   - 1.4.1 Use of color: a change says "Up" or "Down" in words, with an arrow, as well as its color; whether up is good
     is the app's call (`good`), so a rise in costs isn't shown in green.
   - 1.1.1: each Sparkline is an image named by what it measures and its first, last, low and high values.
   - 1.3.1 in Safari: role="list" on the lists without bullets, since WebKit stops calling them lists (FU1, GR151).
   - 1.3.1: the row is a list under its own heading, so a screen reader says how many numbers there are, and each
     card reads label, value, change in that order.
   - 4.1.3: while loading, the list says it's busy (aria-busy) and the skeletons are named once, not once per card.
   - 4.1.3, 3.3.3: a failed load says so once, under the heading, with Try again (EmptyLoadFailed).
   - 1.4.10 reflow: the cards wrap to one column on a phone. */

export interface Stat {
  /** What the number is: "Revenue". */
  label: string;
  /** The number, formatted: "€48,200". */
  value: string;
  /** How it changed since the last period. */
  change?: {
    /** The size of the change, formatted: "12%". */
    amount: string;
    direction: 'up' | 'down' | 'flat';
    /** Whether this direction is good news. Default: up is good, down is bad. */
    good?: boolean;
  };
  /** The values over time, oldest first, for a Sparkline. */
  trend?: readonly number[];
}
export interface StatsRowProps {
  /** The row's heading: "This month". */
  title: string;
  /** The heading level, to fit the page's outline. Default: 2. */
  headingLevel?: 2 | 3 | 4;
  /** The numbers, 2 to 4 of them. */
  stats: readonly Stat[];
  /** What the change compares with: "vs last month". */
  period?: string;
  /** Shows skeletons in place of the numbers while they load. */
  loading?: boolean;
  /** How many skeleton cards to show while loading. Default: 4. */
  loadingCount?: number;
  /** The numbers failed to load: a "Couldn’t load" message with Try again, which calls onRetry, in the cards' place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** Its words, in the page's language. Each one left out stays English. */
  labels?: Partial<StatsRowLabels> | undefined;
}

/** The words StatsRow says. Pass your own for a page in another language. */
export interface StatsRowLabels {
  /** The change badge for a rise: "Up 12%". */
  up: (amount: string) => string;
  /** The change badge for a fall: "Down 4%". */
  down: (amount: string) => string;
  /** The change badge when nothing changed: "No change". */
  flat: string;
  /** The one name while loading, from the title as given: "Loading: This month". */
  loading: (title: string) => string;
  /** The failed load's title, from the title as given: "Couldn’t load This month". */
  loadFailed: (title: string) => string;
  /** A trend line's name: "Revenue, last 8 periods". */
  trend: (label: string, count: number) => string;
}
const EN: StatsRowLabels = {
  up: (amount) => `Up ${amount}`,
  down: (amount) => `Down ${amount}`,
  flat: 'No change',
  loading: (title) => `Loading: ${title}`,
  loadFailed: (title) => `Couldn’t load ${title}`,
  trend: (label, count) => `${label}, last ${count} periods`,
};
/* The grid fits the count: two or three numbers share one row from sm, so a third doesn't sit alone under two;
   four or more go two then four across. */
const COLUMNS: Record<number, string> = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };

/** A row of key numbers, each with its change said in words and an optional trend line. */
export function StatsRow({ title, headingLevel = 2, stats, period, loading = false, loadingCount = 4, loadFailed = false, onRetry, labels }: StatsRowProps) {
  const id = React.useId();
  const w = { ...EN, ...labels };
  // The tiles' words: StatTile's own (the provider's language) unless this row's labels set them.
  const tileWords: NonNullable<React.ComponentProps<typeof SerupaProvider>['labels']> = {};
  if (labels?.up) tileWords.statTileUp = labels.up;
  if (labels?.down) tileWords.statTileDown = labels.down;
  if (labels?.flat) tileWords.statTileFlat = labels.flat;
  if (labels?.trend) tileWords.statTileTrend = labels.trend;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Heading level={headingLevel} size="lg" id={id}>{title}</Heading>
      {loadFailed ? <EmptyLoadFailed title={w.loadFailed(title)} onRetry={() => onRetry?.()} headingLevel={headingLevel === 2 ? 3 : 4} /> : <SerupaProvider labels={tileWords}><ul role="list" aria-busy={loading || undefined} className={`m-0 grid list-none grid-cols-1 gap-6 p-0 ${COLUMNS[loading ? loadingCount : stats.length] ?? COLUMNS[4]}`}>
        {loading
          // One name for all of them: the first skeleton is named, the others are only pictures.
          ? Array.from({ length: loadingCount }, (_, i) => <StatTile as="li" key={i} label="" value="" loading loadingLabel={i === 0 ? w.loading(title) : ''} />)
          : stats.map((s) => <StatTile as="li" key={s.label} label={s.label} value={s.value} change={s.change} period={s.change ? period : undefined} trend={s.trend} />)}
      </ul></SerupaProvider>}
    </section>
  );
}
