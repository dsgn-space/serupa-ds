"use client";
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { List, ListItem } from '../../components/List/List';
import { Navbar, NavbarLink } from '../../components/Navbar/Navbar';
import { NotificationCenter, type NotificationItem } from '../../components/NotificationCenter/NotificationCenter';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';

/* Notifications: a bell in the Navbar that opens the recent ones in a drawer, and a full inbox page with a filter,
   mark as read and mark all as read. Both read the same list. For an app to copy. What it carries (WCAG 2.2):
   - 4.1.2, 1.3.1: the bell is named with its count ("Notifications, 3 unread"), so the number is heard, not only seen.
   - 1.4.1: an unread notification says "Unread" in words and has a bolder title, not only a colored dot.
   - 4.1.3: the count above the list is a status, so marking one read or changing the filter is said politely.
   - 2.4.3: under "Unread", marking one read takes it out of the list; focus goes to the next one's button, or the
     heading when none are left, never to the top of the page.
   Storing what's read is the app's job: onMarkRead and onMarkAllRead hear it. */

export interface NotificationsProps {
  /** The notifications, newest first. Default: a demo account's. */
  items?: readonly NotificationItem[] | undefined;
  /** One was marked read. */
  onMarkRead?: ((id: string) => void) | undefined;
  /** All were marked read. */
  onMarkAllRead?: (() => void) | undefined;
}

// Times are minutes before the page loaded, so they read the same whenever the page is drawn.
const now = Date.now();
const ago = (minutes: number) => now - minutes * 60_000;
const demo: NotificationItem[] = [
  { id: 'n1', title: 'Ana Lima mentioned you in Website redesign', description: '“Can you check the new pricing copy?”', tone: 'info', time: ago(5) },
  { id: 'n2', title: 'Your export is ready', description: 'projects-october.csv, 2.4 MB', tone: 'success', time: ago(42) },
  { id: 'n3', title: 'A payment failed', description: 'The card ending 4242 was declined. Update it to keep your plan.', tone: 'danger', time: ago(180) },
  { id: 'n4', title: 'Budi Santoso joined the team', tone: 'info', time: ago(60 * 20), read: true },
  { id: 'n5', title: 'Storage is almost full', description: '8.6 GB of 10 GB used.', tone: 'warning', time: ago(60 * 23), read: true },
];

type Filter = 'all' | 'unread';

/** The notifications page: a skip link, a Navbar with the bell, then main with the inbox. */
export function Notifications({ items = demo, onMarkRead, onMarkAllRead }: NotificationsProps) {
  const [read, setRead] = React.useState<ReadonlySet<string>>(() => new Set(items.filter((n) => n.read).map((n) => n.id)));
  const [filter, setFilter] = React.useState<Filter>('all');
  const [open, setOpen] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const focusTo = React.useRef<string | null>(null);
  const all = items.map((n) => ({ ...n, read: read.has(n.id) }));
  const unread = all.filter((n) => !n.read).length;
  const shown = filter === 'unread' ? all.filter((n) => !n.read) : all;

  // every render: a focus asked for by a handler (focusTo) moves once the render it caused is on screen.
  React.useEffect(() => {
    const to = focusTo.current;
    focusTo.current = null;
    if (to === 'heading') heading.current?.focus();
    else if (to) document.getElementById(`read-${to}`)?.focus();
  });

  const markRead = (id: string) => {
    if (filter === 'unread') {
      const at = shown.findIndex((n) => n.id === id), next = shown[at + 1] || shown[at - 1];
      focusTo.current = next ? next.id : 'heading';
    }
    setRead((r) => new Set(r).add(id));
    onMarkRead?.(id);
  };
  const markAll = () => { setRead(new Set(items.map((n) => n.id))); onMarkAllRead?.(); };
  const bellName = unread ? `Notifications, ${unread} unread` : 'Notifications';

  return (
    <div className="min-h-screen bg-surface-muted text-text">
      <SkipLink />
      <Navbar brand="Acme" actions={
        <Button variant="ghost" leftIcon="notifications" aria-label={bellName} onClick={() => setOpen(true)}>
          {unread ? <Badge count={unread} /> : null}
        </Button>
      }>
        <NavbarLink href="#dashboard">Dashboard</NavbarLink>
        <NavbarLink href="#projects">Projects</NavbarLink>
        <NavbarLink href="#notifications" active>Notifications</NavbarLink>
      </Navbar>
      <NotificationCenter items={all.slice(0, 5)} open={open} onOpenChange={setOpen} onMarkRead={markRead} onMarkAllRead={markAll} />

      <main id="main" className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 outline-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={1} ref={heading} tabIndex={-1} className="outline-none">Notifications</Heading>
          <Button variant="outline" disabled={!unread} onClick={markAll}>Mark all as read</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl aria-label="Show" value={filter} onValueChange={setFilter}
            options={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' }]} />
          <p role="status" className="m-0 text-sm text-text-muted">{unread ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {shown.length ? (
          <List variant="card" divided aria-label={filter === 'unread' ? 'Unread notifications' : 'All notifications'}>
            {shown.map((n) => (
              <ListItem key={n.id} title={<span className={n.read ? undefined : 'font-semibold'}>{n.title}</span>}
                description={<>{n.description ? <>{n.description} · </> : null}<RelativeTime date={n.time ?? now} />{n.read ? null : <> · Unread</>}</>}
                trailing={n.read ? null : <Button id={`read-${n.id}`} size="sm" variant="ghost" aria-label={typeof n.title === 'string' ? `Mark as read: ${n.title}` : undefined} onClick={() => markRead(n.id)}>Mark as read</Button>} />
            ))}
          </List>
        ) : (
          <p className="m-0 rounded-lg border border-border bg-surface p-6 text-center text-text-muted">No unread notifications. You’re all caught up.</p>
        )}
      </main>
    </div>
  );
}
