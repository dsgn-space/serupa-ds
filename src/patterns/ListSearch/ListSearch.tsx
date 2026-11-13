'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Pagination } from '../../components/Pagination/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectCell, TableLoadingRows, type SortDirection } from '../../components/Table/Table';
import { TableToolbar } from '../../blocks/TableToolbar/TableToolbar';
import { EmptyLoadFailed, EmptyNoResults } from '../../blocks/EmptyStates/EmptyStates';
import { Toaster, toast } from '../../components/Toast/Toast';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* List with search and filters: a page of rows to search, filter, sort, select and page through. For an app to
   copy. What it carries (WCAG 2.2):
   - 4.1.3: the results count ("8 of 24 projects") is a status region, read out as the search or a filter changes,
     without moving focus. Bulk actions say "3 selected" the same way (TableToolbar, TableActionBar).
   - 1.3.1, 4.1.2: the sort is on the column headers (aria-sort, a button each), the selection is real checkboxes named
     after their row, and the table has a caption.
   - 3.3.1-ish: a search that finds nothing says so in words, with the query, and offers "Clear filters", the way out.
     Clearing puts focus on the search field, since the button that was pressed goes away (2.4.3).
   - 2.4.8, 3.2.3: the search, filters, sort and page are kept in the address (`?q=&status=&sort=&page=`), so Back,
     a reload and a shared link all show the same list. Writing the address is the app's job: `onSearchChange`
     gets the new query string.
   - 4.1.3: while the rows load, the results count says "Loading projects" (once, as a status), the table is busy and
     keeps its header, and its placeholder rows are decorative, so nothing jumps when the rows arrive.
   - With no projects at all, it says there are none yet and offers New project, not "Clear filters", since nothing
     is filtered out.
   - 4.1.3, 3.3.3: a failed load says so once, in the table's place, with Try again (EmptyLoadFailed).
   - Changing the search or a filter goes back to page 1, so nobody lands on an empty page 3, and lets go of the
     selected rows it hides, so "2 selected" never counts rows nobody can see, and a bulk action never reaches them.
   - 4.1.3: Archive and Export say what they did in a toast. Archive takes the rows away at once, with Undo; it's done
     for good (onArchive) only when the toast closes without Undo. */

export interface Project { name: string; status: 'Active' | 'Paused' | 'Done'; owner: string; updated: string }
type SortKey = 'name' | 'updated';
interface View { q: string; status: string; owner: string; sort: SortKey; dir: Exclude<SortDirection, 'none'>; page: number }

export interface ListSearchProps {
  /** The rows. Default: 24 demo projects. */
  projects?: readonly Project[] | undefined;
  /** The address's query string to start from: "?q=app&status=Active&sort=updated&dir=descending&page=2". */
  search?: string | undefined;
  /** Called with the new query string whenever the view changes: write it with history.replaceState (or your router). */
  onSearchChange?: ((search: string) => void) | undefined;
  /** Rows on a page. Default: 10. */
  pageSize?: number | undefined;
  /** Archives the rows for good, by name: called once the "Archived" toast closes without Undo. */
  onArchive?: ((names: string[]) => void) | undefined;
  /** The rows failed to load: a "Couldn’t load" message with Try again, which calls onRetry, in their place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** The rows are on their way: the table keeps its header, with placeholder rows, and says it's busy. Default: false. */
  loading?: boolean | undefined;
  /** Exports the selected rows, by name. */
  onExport?: ((names: string[]) => void) | undefined;
}

const OWNERS = ['Ana', 'Budi', 'Chen', 'Dewi'];
const STATUSES: Project['status'][] = ['Active', 'Paused', 'Done'];
const NAMES = ['Website redesign', 'Mobile app', 'Billing migration', 'Help center', 'Onboarding emails', 'Data export',
  'Status page', 'Search ranking', 'Invoice templates', 'Team calendar', 'Single sign-on', 'Dark theme', 'Audit log',
  'Usage reports', 'Partner portal', 'Price page', 'Referral program', 'API keys', 'Mobile push', 'Accessibility review',
  'Translations', 'Release notes', 'Support chat', 'Backup restore'];
const demo: Project[] = NAMES.map((name, i) => ({
  name, status: STATUSES[i % 3] ?? 'Active', owner: OWNERS[(i * 3) % 4] ?? '',
  updated: new Date(Date.UTC(2026, 9, 28 - i)).toISOString().slice(0, 10),
}));

// "6 Nov 2026" in the reader's locale for "2026-11-06", read as that calendar day wherever the reader is; anything
// else as it came. The <time> keeps the ISO day in dateTime.
function shortDay(iso: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  try { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))); } catch { return iso; }
}

/** The view from a query string, with anything missing or unknown at its default. */
export function readView(search: string): View {
  const p = new URLSearchParams(search);
  const page = Number(p.get('page'));
  return {
    q: p.get('q') ?? '', status: p.get('status') ?? '', owner: p.get('owner') ?? '',
    sort: p.get('sort') === 'updated' ? 'updated' : 'name',
    dir: p.get('dir') === 'descending' ? 'descending' : 'ascending',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}
/** The query string for a view, leaving out what's at its default, so a plain list has a plain address. */
export function writeView(v: View): string {
  const p = new URLSearchParams();
  if (v.q) p.set('q', v.q);
  if (v.status) p.set('status', v.status);
  if (v.owner) p.set('owner', v.owner);
  if (v.sort !== 'name') p.set('sort', v.sort);
  if (v.dir !== 'ascending') p.set('dir', v.dir);
  if (v.page > 1) p.set('page', String(v.page));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** The list page: a skip link, a header, then main with the h1, the search and filters, the table and the pages. */
export function ListSearch({ projects = demo, search = '', onSearchChange, pageSize = 10, onArchive, onExport, loading = false, loadFailed = false, onRetry }: ListSearchProps) {
  const locale = useLocale();
  const [view, setView] = React.useState<View>(() => readView(search));
  const [picked, setPicked] = React.useState<string[]>([]);
  const [archived, setArchived] = React.useState<ReadonlySet<string>>(() => new Set());
  const matches = (v: View) => {
    const q = v.q.trim().toLowerCase();
    return projects.filter((p) => !archived.has(p.name) && (!q || p.name.toLowerCase().includes(q)) && (!v.status || p.status === v.status) && (!v.owner || p.owner === v.owner));
  };
  const change = (next: Partial<View>, keepPage = false) => {
    const v = { ...view, ...next, page: keepPage ? next.page ?? view.page : 1 };
    setView(v);
    onSearchChange?.(writeView(v));
    // A narrower search or filter lets go of the selected rows it hides.
    if (v.q !== view.q || v.status !== view.status || v.owner !== view.owner) {
      const shown = new Set(matches(v).map((p) => p.name));
      setPicked((was) => was.filter((n) => shown.has(n)));
    }
  };
  const count = (n: number) => (n === 1 ? '1 project' : `${n} projects`);
  const archive = () => {
    const names = picked;
    setArchived((was) => new Set([...was, ...names]));
    setPicked([]);
    toast.undo({
      title: `Archived ${count(names.length)}`,
      commit: () => onArchive?.(names),
      onUndo: () => setArchived((was) => { const n = new Set(was); for (const x of names) n.delete(x); return n; }),
    });
  };
  const exportRows = () => {
    onExport?.(picked);
    toast({ title: `Exported ${count(picked.length)}`, tone: 'success' });
  };

  const live = projects.length - archived.size;
  const found = matches(view)
    .sort((a, b) => (view.dir === 'ascending' ? 1 : -1) * a[view.sort].localeCompare(b[view.sort]));
  const pages = Math.max(1, Math.ceil(found.length / pageSize));
  const page = Math.min(view.page, pages);
  const rows = found.slice((page - 1) * pageSize, page * pageSize);
  const all = rows.length > 0 && rows.every((p) => picked.includes(p.name));
  const toggle = (n: string) => setPicked(picked.includes(n) ? picked.filter((x) => x !== n) : [...picked, n]);
  const sortBy = (key: SortKey) => change({ sort: key, dir: view.sort === key && view.dir === 'ascending' ? 'descending' : 'ascending' });
  const dir = (key: SortKey): SortDirection => (view.sort === key ? view.dir : 'none');
  const clear = () => change({ q: '', status: '', owner: '' });

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <header className="border-b border-border bg-surface px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme</p>
      </header>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 outline-none">
        <PageHeader title="Projects" primary={{ label: 'New project', href: '#new-project' }} />
        <TableToolbar
          noun="projects"
          query={view.q}
          onQueryChange={(value) => change({ q: value })}
          filters={[
            { label: 'Status', value: view.status, onChange: (value) => change({ status: value }), options: [{ value: '', label: 'All' }, ...STATUSES] },
            { label: 'Owner', value: view.owner, onChange: (value) => change({ owner: value }), options: [{ value: '', label: 'Anyone' }, ...OWNERS] },
          ]}
          results={loadFailed ? '' : loading ? 'Loading projects' : found.length === live ? `${found.length} projects` : `${found.length} of ${live} projects`}
          onClearFilters={clear}
          selectedCount={picked.length}
          onClearSelection={() => setPicked([])}
          bulkActions={<><Button size="sm" variant="outline" onClick={exportRows}>Export</Button><Button size="sm" variant="outline" onClick={archive}>Archive</Button></>}
        >
          {loadFailed ? (
            <EmptyLoadFailed title="Couldn’t load projects" onRetry={() => onRetry?.()} headingLevel={2} />
          ) : loading ? (
            // The header stays, so the columns don't move when the rows arrive; the placeholder rows are decorative.
            <Table caption="Projects" hideCaption loading>
              <TableHead><TableRow>
                <TableHeaderCell><span className="sr-only">Select</span></TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell><TableHeaderCell>Updated</TableHeaderCell>
              </TableRow></TableHead>
              <TableLoadingRows columns={5} rows={Math.min(pageSize, 5)} label="" />
            </Table>
          ) : found.length ? (
            <Table caption="Projects" hideCaption>
              <TableHead><TableRow>
                <TableSelectCell header label="Select all projects on this page" checked={all}
                  indeterminate={!all && rows.some((p) => picked.includes(p.name))}
                  onChange={() => setPicked(all ? picked.filter((n) => !rows.some((p) => p.name === n)) : [...new Set([...picked, ...rows.map((p) => p.name)])])} />
                <TableHeaderCell sort={dir('name')} onSort={() => sortBy('name')}>Name</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell sort={dir('updated')} onSort={() => sortBy('updated')}>Updated</TableHeaderCell>
              </TableRow></TableHead>
              <TableBody>{rows.map((p) => (
                <TableRow key={p.name} selected={picked.includes(p.name)}>
                  <TableSelectCell label={`Select ${p.name}`} checked={picked.includes(p.name)} onChange={() => toggle(p.name)} />
                  <TableCell>{p.name}</TableCell><TableCell>{p.status}</TableCell><TableCell>{p.owner}</TableCell>
                  <TableCell><time dateTime={p.updated}>{shortDay(p.updated, locale)}</time></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : !projects.length ? (
            // No projects at all is a first visit, not a search that missed: there's no filter to clear.
            <EmptyState icon="add_circle" title="No projects yet" headingLevel={2}
              description="A project holds the tasks, files and people for one piece of work. Start one, and it shows up here."
              actions={<Button href="#new-project">New project</Button>} />
          ) : (
            <EmptyNoResults query={view.q} title={(text) => (text ? `No projects match “${text}”` : 'No projects match these filters')}
              description="Check the spelling, or clear the filters to see every project." headingLevel={2} onClearFilters={() => {
              clear();
              document.querySelector<HTMLInputElement>('main form[role="search"] input')?.focus();
            }} />
          )}
        </TableToolbar>
        {!loading && !loadFailed && pages > 1 ? (
          <Pagination count={pages} page={page} onPageChange={(n) => change({ page: n }, true)} total={found.length} pageSize={pageSize}
            aria-label="Projects pages" />
        ) : null}
      </main>
      <Toaster />
    </div>
  );
}
