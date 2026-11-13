'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Field } from '../../components/Field/Field';
import { Select } from '../../components/Select/Select';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { LoadMore } from '../../components/LoadMore/LoadMore';
import { Badge } from '../../components/Badge/Badge';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableLoadingRows } from '../../components/Table/Table';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { EmptyLoadFailed, EmptyNoResults } from '../../blocks/EmptyStates/EmptyStates';
import { useLocale } from '../../internal/provider';

/* Activity log: what people did in a workspace, newest first, with a search, a type filter, more on request, and an
   export. For an app to copy, as the record admins check after something changes. What it carries (WCAG 2.2):
   - 1.3.1: the events are a table with a caption, so each cell is read with its column ("When", "Who", "What").
   - 1.3.1, 1.4.1: each event says what happened in a sentence ("changed Chen Wei's role to Admin"), and its type in
     words beside it, not only by color.
   - 4.1.3: how many events match is a status, so a search or a filter is said politely; Load more says what it added
     and keeps focus on its button.
   - 3.3.3: a search with no matches says so, with a way back to everything; a failed load says so, with Try again.
   - The time is the reader's locale's date and time, with the exact moment in <time dateTime>.
   Fetching and exporting are the app's job: events is what it has, and onExport gets the events that match. */

export type ActivityKind = 'members' | 'billing' | 'security' | 'projects';
export interface ActivityEvent {
  id: string;
  /** When it happened: a time in ms or an ISO string. */
  time: number | string;
  /** Who did it. */
  actor: string;
  /** What they did, as the rest of a sentence after their name: "changed Chen Wei's role to Admin". */
  action: string;
  kind: ActivityKind;
}

export interface ActivityLogProps {
  /** The events, newest first. Default: a demo workspace's. */
  events?: readonly ActivityEvent[] | undefined;
  /** How many show at first, and how many more each Load more adds. Default: 8. */
  pageSize?: number | undefined;
  /** Export was pressed: the events that match the search and filter, newest first. */
  onExport?: ((events: ActivityEvent[]) => void) | undefined;
  /** The events are on their way: a busy table with placeholder rows, named once ("Loading activity"). Default: false. */
  loading?: boolean | undefined;
  /** The events failed to load: a "Couldn’t load the activity log" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const KINDS: { value: ActivityKind; label: string }[] = [
  { value: 'members', label: 'Members' }, { value: 'billing', label: 'Billing' },
  { value: 'security', label: 'Security' }, { value: 'projects', label: 'Projects' },
];
const kindLabel = (k: ActivityKind) => KINDS.find((x) => x.value === k)!.label;

// Times are hours before 9:00 UTC on 12 November 2026, so the demo reads the same whenever it's drawn.
const at = (hours: number) => Date.UTC(2026, 10, 12, 9) - hours * 3600_000;
const demo: ActivityEvent[] = [
  { id: 'e1', time: at(1), actor: 'Ana Lima', action: 'changed Chen Wei’s role to Admin', kind: 'members' },
  { id: 'e2', time: at(3), actor: 'Budi Santoso', action: 'turned on two-step verification', kind: 'security' },
  { id: 'e3', time: at(5), actor: 'Ana Lima', action: 'invited fay@example.com as a Viewer', kind: 'members' },
  { id: 'e4', time: at(9), actor: 'Chen Wei', action: 'created the project Website redesign', kind: 'projects' },
  { id: 'e5', time: at(26), actor: 'Ana Lima', action: 'changed the plan from Starter to Team', kind: 'billing' },
  { id: 'e6', time: at(30), actor: 'Dewi Lestari', action: 'signed out of Firefox on a Windows PC', kind: 'security' },
  { id: 'e7', time: at(49), actor: 'Budi Santoso', action: 'deleted the project Old landing page', kind: 'projects' },
  { id: 'e8', time: at(52), actor: 'Ana Lima', action: 'removed Eko Prasetyo from the team', kind: 'members' },
  { id: 'e9', time: at(75), actor: 'Ana Lima', action: 'updated the card to Visa ending 4242', kind: 'billing' },
  { id: 'e10', time: at(98), actor: 'Chen Wei', action: 'renamed the project Brand refresh to Website redesign', kind: 'projects' },
  { id: 'e11', time: at(120), actor: 'Dewi Lestari', action: 'changed their password', kind: 'security' },
];

/** The events whose person or action holds every word of the query, and whose type is kind (or any). */
export function matchEvents(events: readonly ActivityEvent[], query: string, kind: ActivityKind | 'all'): ActivityEvent[] {
  const words = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return events.filter((e) => (kind === 'all' || e.kind === kind)
    && words.every((w) => `${e.actor} ${e.action}`.toLocaleLowerCase().includes(w)));
}

/** The activity page: a skip link, a header, then main with the h1, the search and filter, and the events. */
export function ActivityLog({ events = demo, pageSize = 8, onExport, loading = false, loadFailed = false, onRetry }: ActivityLogProps) {
  const locale = useLocale();
  const [query, setQuery] = React.useState('');
  const [kind, setKind] = React.useState<ActivityKind | 'all'>('all');
  const [shownCount, setShownCount] = React.useState(pageSize);
  const found = matchEvents(events, query, kind);
  const rows = found.slice(0, shownCount);
  const filtered = !!query.trim() || kind !== 'all';
  // A new search or filter starts from the first page again.
  const refine = (f: () => void) => { f(); setShownCount(pageSize); };
  const when = (t: number | string) => {
    const d = new Date(t);
    try { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d); } catch { return d.toISOString(); }
  };
  const count = loading ? 'Loading activity' : found.length === 1 ? '1 event' : `${found.length} events`;

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Activity log" description="What people did in this workspace, newest first. Kept for a year."
          primary={onExport && !loadFailed ? { label: 'Export', onSelect: () => onExport(found) } : undefined} />
        {loadFailed ? <EmptyLoadFailed title="Couldn’t load the activity log" onRetry={() => onRetry?.()} headingLevel={2} /> : <>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Search the log" className="min-w-0 flex-1 basis-60">
              <SearchInput value={query} onChange={(e) => refine(() => setQuery(e.target.value))} onClear={() => refine(() => setQuery(''))} clearLabel="Clear the search" />
            </Field>
            <Field label="Type" className="w-44">
              <Select value={kind} onChange={(e) => refine(() => setKind(e.target.value as ActivityKind | 'all'))}
                options={[{ value: 'all', label: 'All types' }, ...KINDS]} />
            </Field>
          </div>
          <p role="status" className="m-0 text-sm text-text-muted">{count}</p>

          {loading ? (
            <Table caption="Events" hideCaption busy>
              <TableHead><TableRow><TableHeaderCell>When</TableHeaderCell><TableHeaderCell>Who</TableHeaderCell><TableHeaderCell>What</TableHeaderCell></TableRow></TableHead>
              <TableLoadingRows columns={3} rows={5} label="" />
            </Table>
          ) : !events.length ? (
            <EmptyState icon="history" title="Nothing has happened yet" headingLevel={2} variant="dashed"
              description="When people join, change settings or edit projects, it’s recorded here." />
          ) : !found.length ? (
            <EmptyNoResults query={query.trim() || kindLabel(kind as ActivityKind)} headingLevel={2}
              title={(q) => (query.trim() ? `No events match “${q}”` : `No ${q.toLowerCase()} events`)}
              description="Try other words, or another type." onClearFilters={() => refine(() => { setQuery(''); setKind('all'); })} />
          ) : <>
            <Table caption="Events" hideCaption>
              <TableHead><TableRow><TableHeaderCell>When</TableHeaderCell><TableHeaderCell>Who</TableHeaderCell><TableHeaderCell>What</TableHeaderCell></TableRow></TableHead>
              <TableBody>{rows.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap"><time dateTime={new Date(e.time).toISOString()}>{when(e.time)}</time></TableCell>
                  <TableCell>{e.actor}</TableCell>
                  <TableCell><span className="me-2">{e.action}</span><Badge>{kindLabel(e.kind)}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
            <LoadMore onLoadMore={() => setShownCount((n) => n + pageSize)} hasMore={rows.length < found.length}
              count={rows.length} total={found.length} endText={filtered || found.length > pageSize ? 'That’s every event' : null} />
          </>}
        </>}
      </main>
    </div>
  );
}
