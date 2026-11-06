import * as React from 'react';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import { Heading } from '../../components/Heading/Heading';
import { Sparkline } from '../../components/Sparkline/Sparkline';
import { Loader } from '../../components/Loader/Loader';

/* Stats row (BL2): a row of key numbers for the top of a dashboard, built from the components only, for an app to copy.
   What it carries (WCAG 2.2):
   - 1.4.1 Use of color: a change says "Up" or "Down" in words, with an arrow, as well as its color; whether up is good
     is the app's call (`good`), so a rise in costs isn't shown in green.
   - 1.1.1: each Sparkline is an image named by what it measures and its first, last, low and high values.
   - 1.3.1 in Safari: role="list" on the lists without bullets, since WebKit stops calling them lists (FU1, GR151).
   - 1.3.1: the row is a list under its own heading, so a screen reader says how many numbers there are, and each
     card reads label, value, change in that order.
   - 4.1.3: while loading, the list says it's busy (aria-busy) and the skeletons are named once, not once per card.
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
  /** A trend line's name: "Revenue, last 8 periods". */
  trend: (label: string, count: number) => string;
}
const EN: StatsRowLabels = {
  up: (amount) => `Up ${amount}`,
  down: (amount) => `Down ${amount}`,
  flat: 'No change',
  loading: (title) => `Loading: ${title}`,
  trend: (label, count) => `${label}, last ${count} periods`,
};
const ARROW = { up: 'arrow_upward', down: 'arrow_downward', flat: 'remove' } as const;

/** A row of key numbers, each with its change said in words and an optional trend line. */
export function StatsRow({ title, headingLevel = 2, stats, period, loading = false, loadingCount = 4, labels }: StatsRowProps) {
  const id = React.useId();
  const w = { ...EN, ...labels };
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <Heading level={headingLevel} size="lg" id={id}>{title}</Heading>
      <ul role="list" aria-busy={loading || undefined} className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: loadingCount }, (_, i) => (
            <Card as="li" key={i} padding="md">
              {/* One name for all of them: the first skeleton is named, the others are only pictures. */}
              <Loader variant="skeleton" shape="text" lines={3} label={i === 0 ? w.loading(title) : ''} />
            </Card>
          ))
          : stats.map((s) => {
            const c = s.change;
            const good = c ? (c.good ?? c.direction === 'up') : false;
            const tone = !c || c.direction === 'flat' ? 'neutral' : good ? 'success' : 'danger';
            return (
              <Card as="li" key={s.label} padding="md" className="flex flex-col gap-2">
                <p className="m-0 text-sm text-text-muted">{s.label}</p>
                <p className="m-0 text-2xl font-semibold tabular-nums">{s.value}</p>
                {c ? (
                  <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-text-muted">
                    <Badge tone={tone} leftIcon={ARROW[c.direction]}>{c.direction === 'flat' ? w.flat : w[c.direction](c.amount)}</Badge>
                    {period ? <span>{period}</span> : null}
                  </p>
                ) : null}
                {s.trend && s.trend.length > 1 ? <Sparkline data={s.trend} label={w.trend(s.label, s.trend.length)} className="h-8 w-full" /> : null}
              </Card>
            );
          })}
      </ul>
    </section>
  );
}
