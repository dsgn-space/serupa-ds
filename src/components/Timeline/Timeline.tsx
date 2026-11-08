'use client';
import * as React from 'react';
import { cn, oneOf } from '../../internal/cn';
import { component } from '../../internal/component';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';

export type TimelineAlign = 'start' | 'alternate';
export type TimelineOrientation = 'vertical' | 'horizontal';
export type TimelineStatus = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
const ALIGNS: readonly TimelineAlign[] = ['start', 'alternate'];
const ORIENTATIONS: readonly TimelineOrientation[] = ['vertical', 'horizontal'];
const STATUSES: readonly TimelineStatus[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** 'start' (default): every event on one side of the line. 'alternate': from 768px up, events take turns on either side of a centered line; narrower, they stay on one side. */
  align?: TimelineAlign | undefined;
  /** 'vertical' (default): events down a line. 'horizontal': events along a line, left to right (right to left in
      right-to-left text), for milestones and order tracking; past the width it has, it scrolls sideways in its own box,
      which takes keyboard focus so arrow keys scroll it. align doesn't apply. */
  orientation?: TimelineOrientation | undefined;
  /** With orientation="horizontal": when the box it's in is under 480px wide (a phone, a narrow card), show the
      events down a line instead of scrolling sideways. Default: false. */
  stackWhenNarrow?: boolean | undefined;
  /** TimelineItems, in the order they happened (or newest first: the list keeps whatever order you give). */
  children?: React.ReactNode | undefined;
}

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  /** What happened: "Order shipped". */
  title?: React.ReactNode | undefined;
  /** When it happened, as people read it: "12 Mar, 14:05" or "2 hours ago". */
  time?: React.ReactNode | undefined;
  /** The same moment for machines, on the <time> element: "2026-03-12T14:05". */
  dateTime?: string | undefined;
  /** An icon in the marker instead of a dot: a Material Symbols or custom name, or an element. */
  icon?: IconSource | undefined;
  /** The marker's color: 'neutral' (default), 'primary', 'success', 'warning', 'danger' or 'info'. It's decoration: say the status in the title too. */
  status?: TimelineStatus | undefined;
  /** More about the event, below the title and time. */
  children?: React.ReactNode | undefined;
}

/* Timeline: an <ol> of events, each with a marker (a dot or an icon) on a line that joins them, then a title, a
   time and optional content. align="alternate" puts events on both sides of a centered line from 768px up. */
/** An ordered list of events, for activity feeds and order history. */
export const Timeline = /* @__PURE__ */ component<HTMLOListElement, TimelineProps>('Timeline', function Timeline(props, ref) {
  const { className, align, orientation, stackWhenNarrow, style, ...rest } = props;
  const a = oneOf(ALIGNS, align, 'start');
  if (oneOf(ORIENTATIONS, orientation, 'vertical') === 'vertical') {
    return <ol role="list" {...rest} style={style} ref={ref} className={cn('dk-timeline', a === 'alternate' && 'dk-timeline--alternate', className)} data-component="timeline" />;
  }
  /* Horizontal: the list in a box that scrolls sideways (and is a container, for stackWhenNarrow). The box takes
     focus, so a keyboard can scroll it (WCAG 2.1.1), and is a region named as the list was; className and style go
     to it, as the outermost element. */
  const { 'aria-label': label, 'aria-labelledby': labelledBy, ...list } = rest;
  const named = label != null || labelledBy != null;
  return (
    <div className={cn('dk-timeline-scroll', stackWhenNarrow && 'dk-timeline-scroll--stack', className)} style={style} tabIndex={0}
      role={named ? 'region' : undefined} aria-label={label} aria-labelledby={labelledBy} data-component="timeline" data-orientation="horizontal">
      <ol role="list" {...list} ref={ref} className="dk-timeline dk-timeline--horizontal" />
    </div>
  );
});

/* TimelineItem: an <li> with the marker (aria-hidden: the title says what happened), the title, a <time> and
   the content. The line runs from its marker to the next item's. */
/** One event in a Timeline. */
export const TimelineItem = /* @__PURE__ */ component<HTMLLIElement, TimelineItemProps>('TimelineItem', function TimelineItem(props, ref) {
  const { className, title, time, dateTime, icon, status, children, ...rest } = props;
  const s = oneOf(STATUSES, status, 'neutral');
  return (
    <li {...rest} ref={ref} className={cn('dk-timeline__item', 'dk-timeline__item--' + s, className)}>
      <span className="dk-timeline__rail" aria-hidden="true">
        <span className={cn('dk-timeline__marker', icon != null && 'dk-timeline__marker--icon')}>{icon != null ? asIcon(icon) : null}</span>
      </span>
      <div className="dk-timeline__body">
        {title != null ? <div className="dk-timeline__title">{title}</div> : null}
        {/* A <time> only with dateTime: "13 Mar" or "2 hours ago" alone isn't a date a machine can read, and a
            <RelativeTime> passed as time is a <time> already (L8E59). */}
        {time != null ? dateTime ? <time className="dk-timeline__time" dateTime={dateTime}>{time}</time> : <span className="dk-timeline__time">{time}</span> : null}
        {children != null ? <div className="dk-timeline__content">{children}</div> : null}
      </div>
    </li>
  );
});
