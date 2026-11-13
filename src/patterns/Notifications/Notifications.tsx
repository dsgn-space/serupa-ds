'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { List, ListItem } from '../../components/List/List';
import { Navbar, NavbarLink } from '../../components/Navbar/Navbar';
import { NotificationCenter, type NotificationItem } from '../../components/NotificationCenter/NotificationCenter';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Loader } from '../../components/Loader/Loader';
import { EmptyLoadFailed } from '../../blocks/EmptyStates/EmptyStates';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';

/* Notifications: a bell in the Navbar that opens the recent ones in a drawer, and a full inbox page with a filter,
   mark as read and mark all as read. Both read the same list. For an app to copy. What it carries (WCAG 2.2):
   - 4.1.2, 1.3.1: the bell is named with its count ("Notifications, 3 unread"), so the number is heard, not only seen.
   - 1.4.1: an unread notification says "Unread" in words, besides the dot before it and its bolder title, which
     are what make it stand out at a glance (the same dot and weight as the drawer's).
   - 4.1.3, 3.3.3: a failed load says so once, in the list's place, with Try again (EmptyLoadFailed).
   - 4.1.3: while they load, the count says "Loading notifications" and the list is busy, with placeholder rows.
   - 4.1.3: the count above the list is a status, so marking one read or changing the filter is said politely.
   - 2.4.3: marking one read on the page takes its button away (and, under "Unread", the notification too), so focus
     goes to the next unread one's button, or the heading when none are left; after Mark all as read it goes to the
     heading. Never to the top of the page. In the drawer, focus stays in the drawer.
   - People choose what interrupts them: "Notification settings" sits by the heading (in More actions on a phone), and the empty state links there
     too (the Ethical design rule: turning notifications off takes no more steps than turning them on).
   Storing what's read is the app's job: onMarkRead and onMarkAllRead hear it. */

export interface NotificationsProps {
  /** The notifications, newest first. Default: a demo account's. */
  items?: readonly NotificationItem[] | undefined;
  /** One was marked read. */
  onMarkRead?: ((id: string) => void) | undefined;
  /** All were marked read. */
  onMarkAllRead?: (() => void) | undefined;
  /** The notifications failed to load: a "Couldn’t load" message with Try again, which calls onRetry, in their place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** The notifications are on their way: placeholder rows, and the count says "Loading notifications". Default: false. */
  loading?: boolean | undefined;
  /** Where "Notification settings" leads: the page where people choose which notifications they get. Default: "#settings-notifications". */
  settingsHref?: string | undefined;
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
export function Notifications({ items = demo, onMarkRead, onMarkAllRead, settingsHref = '#settings-notifications', loading = false, loadFailed = false, onRetry }: NotificationsProps) {
  // Marked read here, on top of what the items say, so items that arrive later (after loading) keep their own.
  const [read, setRead] = React.useState<ReadonlySet<string>>(() => new Set());
  const [filter, setFilter] = React.useState<Filter>('all');
  const [open, setOpen] = React.useState(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const focusTo = React.useRef<string | null>(null);
  const all = items.map((n) => ({ ...n, read: !!n.read || read.has(n.id) }));
  const unread = all.filter((n) => !n.read).length;
  const shown = filter === 'unread' ? all.filter((n) => !n.read) : all;

  // every render: a focus asked for by a handler (focusTo) moves once the render it caused is on screen.
  React.useEffect(() => {
    const to = focusTo.current;
    focusTo.current = null;
    if (to === 'heading') heading.current?.focus();
    else if (to) document.getElementById(`read-${to}`)?.focus();
  });

  // onPage: pressed on the page, whose button goes away with it; the drawer keeps focus itself.
  const markRead = (id: string, onPage?: boolean) => {
    if (onPage) {
      const at = shown.findIndex((n) => n.id === id);
      const next = shown.slice(at + 1).find((n) => !n.read) || shown.slice(0, at).reverse().find((n) => !n.read);
      focusTo.current = next ? next.id : 'heading';
    }
    setRead((r) => new Set(r).add(id));
    onMarkRead?.(id);
  };
  const markAll = (onPage?: boolean) => {
    if (onPage) focusTo.current = 'heading';
    setRead(new Set(items.map((n) => n.id)));
    onMarkAllRead?.();
  };
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
      <NotificationCenter items={all.slice(0, 5)} open={open} onOpenChange={setOpen} onMarkRead={(id) => markRead(id)} onMarkAllRead={() => markAll()} />

      <main id="main" className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 outline-none">
        <PageHeader title="Notifications" headingRef={heading}
          primary={{ label: 'Mark all as read', disabled: loading || loadFailed || !unread, onSelect: () => markAll(true) }}
          secondary={[{ label: 'Notification settings', icon: 'settings', href: settingsHref }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl aria-label="Show" value={filter} onValueChange={setFilter}
            options={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' }]} />
          <p role="status" className="m-0 text-sm text-text-muted">{loadFailed ? '' : loading ? 'Loading notifications' : unread ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {loadFailed ? (
          <EmptyLoadFailed title="Couldn’t load your notifications" onRetry={() => onRetry?.()} headingLevel={2} />
        ) : loading ? (
          // Placeholder rows the shape of a notification; the status above says it's loading, so they're pictures only.
          <ul role="list" aria-busy="true" aria-label="All notifications" className="m-0 flex list-none flex-col gap-4 rounded-lg border border-border bg-surface p-4">
            {[0, 1, 2].map((i) => <li key={i}><Loader variant="skeleton" shape="text" size="sm" lines={2} label="" /></li>)}
          </ul>
        ) : !items.length ? (
          <EmptyState icon="notifications" title="No notifications yet" headingLevel={2} variant="dashed"
            description="When someone mentions you, an export finishes or a payment needs you, it shows up here."
            actions={<Button variant="outline" leftIcon="settings" href={settingsHref}>Choose what you hear about</Button>} />
        ) : shown.length ? (
          <List variant="card" divided aria-label={filter === 'unread' ? 'Unread notifications' : 'All notifications'}>
            {shown.map((n) => (
              <ListItem key={n.id}
                // The drawer's unread dot before the title (and room for it on read ones, so the titles line up).
                title={<span className="flex items-baseline gap-2"><span className={'dk-notification-center__dot self-center' + (n.read ? ' invisible' : '')} aria-hidden="true" /><span className={n.read ? undefined : 'font-semibold'}>{n.title}</span></span>}
                description={<>{n.description ? <>{n.description} · </> : null}<RelativeTime date={n.time ?? now} />{n.read ? null : <> · Unread</>}</>}
                trailing={n.read ? null : <Button id={`read-${n.id}`} size="sm" variant="ghost" aria-label={typeof n.title === 'string' ? `Mark as read: ${n.title}` : undefined} onClick={() => markRead(n.id, true)}>Mark as read</Button>} />
            ))}
          </List>
        ) : (
          <p className="m-0 rounded-lg border border-border bg-surface p-6 text-center text-text-muted">No unread notifications. You’re all caught up.</p>
        )}
      </main>
    </div>
  );
}
