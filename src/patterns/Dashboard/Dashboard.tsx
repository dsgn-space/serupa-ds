"use client";
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Link } from '../../components/Link/Link';
import { Loader } from '../../components/Loader/Loader';
import { Meter } from '../../components/Meter/Meter';
import { Progress } from '../../components/Progress/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/Table/Table';
import { StatsRow, type Stat } from '../../blocks/StatsRow/StatsRow';
import { ActivityFeed, type ActivityEvent } from '../../blocks/ActivityFeed/ActivityFeed';
import { EmptyFirstRun } from '../../blocks/EmptyStates/EmptyStates';

/* Dashboard: the page an account lands on. Key numbers, how much of the plan is used, the latest projects and what
   the team did, with skeletons while it loads and a first-run state before there's anything to show. For an app to
   copy. What it carries (WCAG 2.2):
   - 1.3.1: each part is a region named by its h2 (the numbers, Usage, Recent projects, Activity), so a screen reader
     can list them and jump to one. The numbers and the projects are a list and a table, not boxes of text.
   - 1.4.1: a change says "Up 12%" or "Down 3%" in words with its arrow (StatsRow); the storage meter says "almost
     full" in words when it turns amber, not by color alone.
   - 4.1.3: while the page loads, main says it's busy (aria-busy) and each part has one named skeleton, so a screen
     reader hears "Loading" once per part, not once per grey bar. Nothing moves focus when the data arrives.
   - 2.4.4: "All projects" and each project's name are links that say where they go.
   - 1.4.10: the parts stack in one column on a phone; the table scrolls inside its own box rather than the page.
   - First run: with no projects yet, the page says so and offers the one button that starts one, instead of a row of
     zeros and empty boxes.
   Fetching the numbers, and what each one counts, is the app's job: pass them as `data`, or `loading` until then. */

export interface RecentProject { name: string; href: string; status: string; updated: string }
export interface DashboardData {
  /** The key numbers, two to four (StatsRow). */
  stats: readonly Stat[];
  /** Storage used and the plan's limit, in GB. */
  storage: { used: number; limit: number };
  /** A goal for the period: "Launch checklist", 3 of 5 done. */
  goal: { label: string; done: number; total: number };
  /** The latest projects, newest first: five is plenty. */
  projects: readonly RecentProject[];
  /** What the team did, newest first. */
  activity: readonly ActivityEvent[];
}

export interface DashboardProps {
  /** What the page shows. Default: a demo account. */
  data?: DashboardData | undefined;
  /** Shows skeletons in place of each part until the data arrives. */
  loading?: boolean | undefined;
  /** The person's name, for the greeting. */
  name?: string | undefined;
  /** "New project" was pressed: in the header, or the first-run state. */
  onCreateProject?: (() => void) | undefined;
  /** Loads more activity. Return its promise, so the button shows it's busy. Without it, the demo pages through `data`. */
  onLoadMoreActivity?: (() => PromiseLike<unknown>) | undefined;
  /** With `onLoadMoreActivity`: false after the last page. */
  hasMoreActivity?: boolean | undefined;
}

const day = (n: number) => new Date(Date.UTC(2026, 10, 6, 9) - n * 3600_000 * 5).toISOString();
const PEOPLE = ['Ana Lima', 'Budi Santoso', 'Chen Wei', 'Dewi Lestari'];
const demo: DashboardData = {
  stats: [
    { label: 'Active projects', value: '12', change: { amount: '2', direction: 'up' } },
    { label: 'Tasks done', value: '148', change: { amount: '12%', direction: 'up' }, trend: [96, 110, 104, 121, 132, 148] },
    { label: 'Open issues', value: '23', change: { amount: '3%', direction: 'down', good: true } },
    { label: 'Spend', value: '$3,240', change: { amount: '8%', direction: 'up', good: false } },
  ],
  storage: { used: 8.6, limit: 10 },
  goal: { label: 'Launch checklist', done: 3, total: 5 },
  projects: [
    { name: 'Website redesign', href: '#website-redesign', status: 'Active', updated: '2026-11-06' },
    { name: 'Billing migration', href: '#billing-migration', status: 'Active', updated: '2026-11-05' },
    { name: 'Help center', href: '#help-center', status: 'Paused', updated: '2026-11-03' },
    { name: 'Mobile app', href: '#mobile-app', status: 'Active', updated: '2026-11-02' },
    { name: 'Data export', href: '#data-export', status: 'Done', updated: '2026-10-30' },
  ],
  activity: [
    ['commented on', 'Website redesign'], ['closed', 'Issue 214'], ['created', 'Billing migration'], ['uploaded 3 files to', 'Help center'],
    ['invited Dewi Lestari to', 'Mobile app'], ['moved to Done', 'Data export'], ['commented on', 'Billing migration'], ['reopened', 'Issue 198'],
    ['renamed', 'Help center'], ['archived', 'Old brand kit'],
  ].map(([action, target], i) => ({
    id: `e${i}`, actor: { name: PEOPLE[i % 4] }, action, target: { label: target, href: `#${target.toLowerCase().replace(/\s+/g, '-')}` }, date: day(i),
  })),
};

const PAGE = 4;
const gb = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} GB`;

/** The dashboard page: a skip link, a header, then main with the h1 and its parts. */
export function Dashboard({ data = demo, loading = false, name = 'Ana', onCreateProject, onLoadMoreActivity, hasMoreActivity = false }: DashboardProps) {
  const [shown, setShown] = React.useState(PAGE);
  const firstRun = !loading && data.projects.length === 0;
  const events = onLoadMoreActivity ? data.activity : data.activity.slice(0, shown);
  const more = () => (onLoadMoreActivity ? onLoadMoreActivity() : Promise.resolve().then(() => setShown((n) => n + PAGE)));
  const { used, limit } = data.storage;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" aria-busy={loading || undefined} className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 outline-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={1}>Good morning, {name}</Heading>
          {firstRun ? null : <Button leftIcon="add" onClick={onCreateProject}>New project</Button>}
        </div>

        {firstRun ? (
          <Card>
            <EmptyFirstRun title="No projects yet" headingLevel={2} createLabel="New project" onCreate={() => onCreateProject?.()}
              description="A project holds the tasks, files and people for one piece of work. Start one, and its numbers show up here."
              learnHref="#guide" learnLabel="How projects work" />
          </Card>
        ) : (
          <>
            <StatsRow title="This month" period="vs last month" stats={data.stats} loading={loading} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section aria-labelledby="dash-projects" className="flex min-w-0 flex-col gap-3 lg:col-span-2">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Heading level={2} size="lg" id="dash-projects">Recent projects</Heading>
                  <Link href="#projects">All projects</Link>
                </div>
                <Card padding="none" className="min-w-0 overflow-x-auto">
                  {loading ? (
                    <div className="p-4"><Loader variant="skeleton" shape="text" lines={5} label="Loading: Recent projects" /></div>
                  ) : (
                    <Table caption="Recent projects" hideCaption>
                      <TableHead><TableRow>
                        <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Updated</TableHeaderCell>
                      </TableRow></TableHead>
                      <TableBody>{data.projects.map((p) => (
                        <TableRow key={p.href}>
                          <TableCell><Link href={p.href}>{p.name}</Link></TableCell>
                          <TableCell>{p.status}</TableCell>
                          <TableCell><time dateTime={p.updated}>{p.updated}</time></TableCell>
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                  )}
                </Card>
              </section>

              <section aria-labelledby="dash-usage" className="flex min-w-0 flex-col gap-3">
                <Heading level={2} size="lg" id="dash-usage">Usage</Heading>
                <Card className="flex flex-col gap-5">
                  {loading ? <Loader variant="skeleton" shape="text" lines={4} label="Loading: Usage" /> : (
                    <>
                      <Meter label="Storage" showValue value={used} max={limit} high={limit * 0.8} optimum={0}
                        formatValue={(v, _, max) => `${gb(v)} of ${gb(max)}${v >= max * 0.8 ? ', almost full' : ''}`} />
                      <Progress label={data.goal.label} showValue value={data.goal.done} max={data.goal.total}
                        formatValue={(v, max) => `${v} of ${max} done`} />
                      <Link href="#billing">Change plan</Link>
                    </>
                  )}
                </Card>
              </section>
            </div>

            {loading ? (
              <section aria-labelledby="dash-activity" className="flex flex-col gap-3">
                <Heading level={2} size="lg" id="dash-activity">Activity</Heading>
                <Card><Loader variant="skeleton" shape="text" lines={4} label="Loading: Activity" /></Card>
              </section>
            ) : (
              <Card>
                <ActivityFeed events={events} onLoadMore={more} total={onLoadMoreActivity ? undefined : data.activity.length}
                  hasMore={onLoadMoreActivity ? hasMoreActivity : shown < data.activity.length} />
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
