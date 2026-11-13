'use client';
import * as React from 'react';
import { Avatar } from '../../components/Avatar/Avatar';
import { Heading } from '../../components/Heading/Heading';
import { Link } from '../../components/Link/Link';
import { Loader } from '../../components/Loader/Loader';
import { EmptyLoadFailed } from '../EmptyStates/EmptyStates';
import { LoadMore } from '../../components/LoadMore/LoadMore';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { Timeline, TimelineItem, type TimelineStatus } from '../../components/Timeline/Timeline';

/* Activity feed (BL7): who did what and when, newest first, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the feed is a region named by its heading, and the events are an ordered list, so a screen reader hears
     how many there are and can move between them.
   - 1.1.1: each event says who in words; the avatar beside the name is decoration and is hidden from screen readers.
   - 1.3.1: each time is a <time> with the exact moment for machines, "5 minutes ago" for people, and the full date in
     its tooltip (RelativeTime).
   - 2.4.3 / 4.1.3: "Load more" (LoadMore) keeps focus on the button as new events land above it, says how many
     were added, and moves focus to the end text after the last page, so focus is never lost.
   - 4.1.3: while the first page loads, the list says it's busy (aria-busy) and its skeleton rows are named once
     ("Loading: Activity"), not once per row; the heading is there from the start, so the page doesn't jump.
   - 4.1.3, 3.3.3: a failed first load says so once, under the heading, with Try again (EmptyLoadFailed).
   - Each word is a prop or a label, English by default. */

function line(e: ActivityEvent): React.ReactNode {
  const target = e.target && (e.target.href ? <Link href={e.target.href}>{e.target.label}</Link> : e.target.label);
  if (typeof e.action === 'function') return e.action(target);
  return <>{e.action}{target && <> {target}</>}</>;
}

export interface ActivityEvent {
  id: string;
  /** Who did it. */
  actor: { name: string; avatar?: string | undefined };
  /** What they did, after their name: "commented on", "closed". When the language puts the target inside the
      sentence (German "hat Bericht 3 kommentiert", Japanese "が報告書3にコメントしました"), pass a function: it
      gets the target, link and all, and returns the words around it. */
  action: string | ((target: React.ReactNode) => React.ReactNode);
  /** What they did it to, after the action: a page or a record, with a link when it has one. */
  target?: { label: string; href?: string | undefined } | undefined;
  /** When. A Date, a timestamp or an ISO string. */
  date: Date | number | string;
  /** More about it, under the line: a comment's first words, what changed. */
  detail?: React.ReactNode | undefined;
  /** The marker's color, from the event's kind; the words still say what happened. */
  status?: TimelineStatus | undefined;
}

export interface ActivityFeedProps {
  events: readonly ActivityEvent[];
  /** Loads the next page. Return its promise, so the button shows loading and takes one press at a time. */
  onLoadMore: () => void | PromiseLike<unknown>;
  /** False after the last page. */
  hasMore: boolean;
  /** How many events there are in all, for "Showing 20 of 134". */
  total?: number | undefined;
  /** The feed's heading. Default: "Activity". */
  title?: string | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
  /** Shown when there are no events. Default: "No activity yet". */
  emptyText?: string | undefined;
  /** The button's words. Default: LoadMore's "Load more". */
  loadMoreLabel?: string | undefined;
  /** Shown after the last page. Default: LoadMore's "You’ve reached the end". */
  endText?: string | undefined;
  /** The first page is on its way: skeleton rows in place of the events. Default: false. */
  loading?: boolean | undefined;
  /** How many skeleton rows to show while loading. Default: 3. */
  loadingCount?: number | undefined;
  /** The skeletons' one name. Default: "Loading: " and the title. */
  loadingText?: string | undefined;
  /** The load failed: a "Couldn’t load" message with Try again, which calls onRetry, in the list's place. Default: false. */
  loadFailed?: boolean | undefined;
  /** Loads again, after a failed load. Return a promise: Try again shows it's working until it settles. */
  onRetry?: (() => void | Promise<unknown>) | undefined;
  /** The failed load's title. Default: "Couldn’t load the activity". */
  loadFailedText?: string | undefined;
}

/** Who did what and when, newest first, with "Load more" that keeps focus in place and says how many were added. */
export function ActivityFeed({ events, onLoadMore, hasMore, total, title = 'Activity', headingLevel = 2, emptyText = 'No activity yet', loadMoreLabel, endText, loading = false, loadingCount = 3, loadingText, loadFailed = false, onRetry, loadFailedText = 'Couldn’t load the activity' }: ActivityFeedProps) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Heading level={headingLevel} id={id}>{title}</Heading>
      {loadFailed ? <EmptyLoadFailed title={loadFailedText} onRetry={() => onRetry?.()} headingLevel={headingLevel === 2 ? 3 : 4} /> : loading ? (
        <ul role="list" aria-busy="true" className="m-0 flex list-none flex-col gap-4 p-0">
          {Array.from({ length: loadingCount }, (_, i) => (
            <li key={i} className="flex items-start gap-2">
              <Loader variant="skeleton" shape="circle" label="" className="shrink-0" />
              {/* One name for all of them: the first row is named, the others are only pictures. */}
              <Loader variant="skeleton" shape="text" size="sm" lines={2} label={i === 0 ? (loadingText ?? 'Loading: ' + title) : ''} className="min-w-0 flex-1" />
            </li>
          ))}
        </ul>
      ) : events.length === 0 ? <p className="text-sm text-text-muted">{emptyText}</p> : (
        <Timeline>
          {events.map((e) => (
            <TimelineItem key={e.id} status={e.status}
              title={<span className="flex items-start gap-2 font-normal">
                <Avatar size="xs" name={e.actor.name} src={e.actor.avatar} alt="" />
                <span><strong className="font-semibold">{e.actor.name}</strong> {line(e)}</span>
              </span>}
              time={<RelativeTime date={e.date} />}>
              {e.detail}
            </TimelineItem>
          ))}
        </Timeline>
      )}
      {!loading && !loadFailed && events.length > 0 && <LoadMore onLoadMore={onLoadMore} hasMore={hasMore} count={events.length} total={total} label={loadMoreLabel} endText={endText} />}
    </section>
  );
}
