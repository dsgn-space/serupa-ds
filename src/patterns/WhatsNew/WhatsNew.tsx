'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Link } from '../../components/Link/Link';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { Card } from '../../components/Card/Card';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { formatDate } from '../../components/FormattedDate/FormattedDate';

/* What's new: the product's changes, newest first, by month; what's new since your last visit marked; a filter by kind;
   and older months on request. For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1, 2.4.6: each month is a heading, each change an article named by its own heading, with its date in a <time>.
   - 1.4.1: the kind (New, Improved, Fixed) is a word in a badge, never a color alone; so is "Since your last visit".
   - 4.1.3: the filter says how many changes it shows, in a status.
   - 2.4.3: Show older months moves focus to the first change it adds.
   Where the changes come from is the app's job: pass them, and when this person last looked. */

export type ChangeKind = 'new' | 'improved' | 'fixed';
export interface Change { id: string; date: string; kind: ChangeKind; title: string; body: string; href?: string | undefined }

export interface WhatsNewProps {
  changes?: Change[] | undefined;
  /** When this person last looked, as YYYY-MM-DD: later changes are marked. */
  lastSeen?: string | undefined;
  /** How many months show at first. Default: 2. */
  months?: number | undefined;
  /** Still loading: a placeholder shows instead of the changes. Default: false. */
  loading?: boolean | undefined;
  /** Loading failed: a "Couldn’t load what’s new" message with Try again, which calls onRetry. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, from Try again. Return a promise: the button shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
}

const demo: Change[] = [
  { id: 'c9', date: '2026-03-12', kind: 'new', title: 'Share a board with people outside your team', body: 'Send a link that lets them view or comment, and turn it off when you’re done.', href: '#sharing' },
  { id: 'c8', date: '2026-03-05', kind: 'improved', title: 'Search finds words in attachments', body: 'PDFs and documents you attach are searched too, a few minutes after they’re added.' },
  { id: 'c7', date: '2026-03-02', kind: 'fixed', title: 'Due dates no longer move a day in some time zones', body: 'Dates set west of UTC kept their day when the board was opened elsewhere.' },
  { id: 'c6', date: '2026-02-20', kind: 'new', title: 'Dark mode', body: 'Choose it in Settings, or follow your system.', href: '#appearance' },
  { id: 'c5', date: '2026-02-11', kind: 'improved', title: 'Faster boards with many cards', body: 'Boards with over a thousand cards open about twice as fast.' },
  { id: 'c4', date: '2026-01-28', kind: 'fixed', title: 'Pasting a list makes one card per line again', body: 'A change in January had put the whole list in one card.' },
  { id: 'c3', date: '2026-01-14', kind: 'new', title: 'Recurring cards', body: 'A card can come back every day, week or month, with its checklist reset.' },
];
const KINDS: Record<ChangeKind, { label: string; tone: 'success' | 'info' | 'warning' }> = {
  new: { label: 'New', tone: 'success' },
  improved: { label: 'Improved', tone: 'info' },
  fixed: { label: 'Fixed', tone: 'warning' },
};

/** Changes grouped by month ("2026-03"), newest month first and newest change first in each. */
export function byMonth(changes: Change[]) {
  const sorted = [...changes].sort((a, b) => b.date.localeCompare(a.date));
  const out: { month: string; changes: Change[] }[] = [];
  for (const c of sorted) {
    const m = c.date.slice(0, 7);
    if (out.at(-1)?.month === m) out.at(-1)!.changes.push(c);
    else out.push({ month: m, changes: [c] });
  }
  return out;
}

/** The What's new page: a skip link, a header, then main with the h1, the filter, and the changes by month. */
export function WhatsNew({ changes = demo, lastSeen = '2026-03-03', months = 2, loading = false, loadFailed = false, onRetry }: WhatsNewProps) {
  const locale = useLocale();
  const [kind, setKind] = React.useState<'all' | ChangeKind>('all');
  const [shown, setShown] = React.useState(months);
  const firstAdded = React.useRef<string | null>(null);
  const shownList = kind === 'all' ? changes : changes.filter((c) => c.kind === kind);
  const groups = byMonth(shownList);
  const visible = groups.slice(0, shown);
  const count = visible.reduce((n, g) => n + g.changes.length, 0);
  const unseen = changes.filter((c) => c.date > lastSeen).length;
  const monthName = (m: string) => formatDate(`${m}-01`, locale, { options: { month: 'long', year: 'numeric' } });
  const dayName = (d: string) => formatDate(d, locale, { options: { day: 'numeric', month: 'long' } });

  const more = () => {
    firstAdded.current = groups[shown]?.changes[0]?.id ?? null;
    setShown((s) => s + months);
  };
  React.useEffect(() => {
    if (!firstAdded.current) return;
    document.getElementById(`change-${firstAdded.current}-title`)?.focus();
    firstAdded.current = null;
  }, [shown]);

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Boards</p>
        <Link underline="hover" href="#help">Help</Link>
      </header>
      <main id="main" className="mx-auto flex max-w-2xl flex-col px-4 py-8 outline-none">
        <PageHeader title="What’s new" description={loading || loadFailed ? undefined : unseen ? `${unseen === 1 ? '1 change' : `${formatNumber(unseen, locale)} changes`} since your last visit, marked below.` : 'You’ve seen every change. New ones show here first.'} />
        {loadFailed ? <div className="pt-6"><EmptyLoadFailed title="Couldn’t load what’s new" onRetry={() => onRetry?.()} headingLevel={2} /></div>
          : loading ? <Card className="mt-6"><Skeleton shape="text" lines={6} label="Loading what’s new" /></Card> : (<>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <SegmentedControl aria-label="Show" value={kind} onValueChange={(v) => { setKind(v); setShown(months); }}
            options={[{ value: 'all', label: 'All' }, { value: 'new', label: 'New' }, { value: 'improved', label: 'Improved' }, { value: 'fixed', label: 'Fixed' }]} />
          <p role="status" id="changes-count" className="m-0 text-sm text-text-muted">{count === 1 ? 'Showing 1 change' : `Showing ${formatNumber(count, locale)} changes`}</p>
        </div>
        <div className="flex flex-col gap-8 pt-6">
          {visible.map((g) => (
            <section key={g.month} aria-labelledby={`month-${g.month}`} className="flex flex-col gap-4">
              <h2 id={`month-${g.month}`} className="m-0 border-b border-border pb-2 text-lg font-semibold">{monthName(g.month)}</h2>
              {g.changes.map((c) => (
                <article key={c.id} aria-labelledby={`change-${c.id}-title`} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={KINDS[c.kind].tone}>{KINDS[c.kind].label}</Badge>
                    {c.date > lastSeen ? <Badge tone="primary" variant="outline">Since your last visit</Badge> : null}
                    <time dateTime={c.date} className="text-sm text-text-muted">{dayName(c.date)}</time>
                  </div>
                  <h3 id={`change-${c.id}-title`} tabIndex={-1} className="m-0 text-base font-semibold outline-none">{c.title}</h3>
                  <p className="m-0">{c.body}</p>
                  {c.href ? <Link href={c.href} aria-label={`Try it: ${c.title}`}>Try it</Link> : null}
                </article>
              ))}
            </section>
          ))}
          {!visible.length ? <p className="m-0 text-text-muted">No changes of this kind yet.</p> : null}
          {groups.length > shown ? <div><Button variant="secondary" onClick={more}>Show older months</Button></div> : null}
        </div>
        </>)}
      </main>
    </div>
  );
}
