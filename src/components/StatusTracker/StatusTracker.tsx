'use client';
import * as React from 'react';
import { cn, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { en as words } from './labels';

/** A day's state: up, degraded (partly working), down, or none (no data). */
export type StatusState = 'up' | 'degraded' | 'down' | 'none';

/** One bar: a day (or any period) and how it went. */
export interface StatusDay {
  /** The day: a Date or a "yyyy-mm-dd" string. */
  date: Date | string;
  state: StatusState;
  /** More about it, said after the state ("API slow for 40 minutes"). */
  note?: string | undefined;
}

export interface StatusTrackerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The days, oldest first. */
  days: StatusDay[];
  /** What it tracks ("API"): names the strip for screen readers. */
  label: string;
  /** The line under the strip. Default: "99.8% up over 90 days, 2 incidents", worked out from days; null for none. */
  summary?: React.ReactNode | null | undefined;
  /** A key to the four states under the strip. Default: true. */
  legend?: boolean | undefined;
}

const STATES: StatusState[] = ['up', 'degraded', 'down', 'none'];
const toDate = (d: Date | string) => {
  if (d instanceof Date) return d;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(d);
};

const wordOf = (L: typeof words, s: StatusState) => (s === 'up' ? L.statusUp : s === 'degraded' ? L.statusDegraded : s === 'down' ? L.statusDown : L.statusNone);

// The bars, each named in words. Memoized: pointing at a day changes only the caption, so the 90 bars and their names
// aren't drawn again on every move of the pointer, nor when a parent renders with the same days.
const Bars = /* @__PURE__ */ React.memo(function Bars(p: { days: StatusDay[]; current: number; say: (d: StatusDay) => string; on: (i: number, focus: boolean) => void }) {
  return p.days.map((d, i) => (
    <li key={i} className="dk-status-tracker__day" data-state={d.state} aria-label={p.say(d)} {...{ tabIndex: i === p.current ? 0 : -1 }}
      onFocus={() => p.on(i, true)} onMouseEnter={() => p.on(i, false)} />
  ));
});

/* StatusTracker: a strip of bars, one a day, for uptime or job history. Each state differs by shape as well as color:
   up a solid bar, degraded a striped one, down a short one, no data an outline. The strip is one tab stop: the arrow
   keys, Home and End move between days, and the caption under it says the focused or pointed day in words ("Nov 3,
   2026: Degraded. API slow"), as each bar's name does for screen readers. A summary line and a legend follow. */
/** A strip of day bars for uptime or job history, with each day in words and a summary.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const StatusTracker = /* @__PURE__ */ component<HTMLDivElement, StatusTrackerProps>('StatusTracker', function StatusTracker(props, ref) {
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { days: 1, label: 1, summary: 1, legend: 1, className: 1 } as const);
  const days = props.days || [];
  // The day with the tab stop; null is the latest, so days loaded after it mounts, or a new day, keep it there.
  const [at, setAtIndex] = React.useState<number | null>(null);
  const setAt = (i: number) => setAtIndex(i === days.length - 1 ? null : i);
  const [shown, setShown] = React.useState<number | null>(null);
  const list = React.useRef<HTMLOListElement | null>(null);
  const dateFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }), [locale]);
  const say = React.useCallback((d: StatusDay) => L.statusDay(dateFmt.format(toDate(d.date)), wordOf(L, d.state)) + (d.note ? '. ' + d.note : ''), [L, dateFmt]);

  const known = days.filter((d) => d.state !== 'none');
  const upShare = known.length ? known.filter((d) => d.state === 'up').length / known.length : 1;
  const incidents = known.filter((d) => d.state !== 'up').length;
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(upShare);
  const summary = props.summary === undefined ? L.statusSummary(percent, days.length, incidents) : props.summary;

  const current = Math.min(Math.max(at ?? days.length - 1, 0), days.length - 1);
  const move = (i: number) => {
    const n = Math.min(Math.max(i, 0), days.length - 1);
    setAt(n); setShown(n);
    const el = list.current && list.current.children[n];
    if (el instanceof HTMLElement) el.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLOListElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const k = e.key, next = rtl ? 'ArrowLeft' : 'ArrowRight', prev = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (k === next) move(current + 1);
    else if (k === prev) move(current - 1);
    else if (k === 'Home') move(0);
    else if (k === 'End') move(days.length - 1);
    else if (k === 'Escape') { setShown(null); return; }
    else return;
    e.preventDefault();
  };

  const listEvents = {
    onKeyDown,
    onMouseLeave: () => setShown(null),
    onBlur: (e: React.FocusEvent<HTMLOListElement>) => { if (!e.currentTarget.contains(e.relatedTarget)) setShown(null); },
  };
  // Too many days for the width: the strip scrolls in its own box, starting at the latest day.
  React.useEffect(() => {
    const el = list.current;
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = getComputedStyle(el).direction === 'rtl' ? -el.scrollWidth : el.scrollWidth;
  }, [days.length]);
  // The bars read the latest setAt through this, so Bars' props stay the same while only the pointed day changes.
  const live = React.useRef(setAt); live.current = setAt;
  const on = React.useCallback((i: number, focus: boolean) => { if (focus) live.current(i); setShown(i); }, []);
  const caption = shown != null && days[shown] ? say(days[shown]) : null;
  return (
    <div {...rest} ref={(n) => setRef(ref, n)} className={cn('dk-status-tracker', props.className)} data-component="status-tracker">
      {/* One tab stop for the days (roving tabindex, as Table's and CodeBlock's scroll areas spread theirs): the keys
          move focus between the list's own items, so the list takes them. */}
      <ol className="dk-status-tracker__days" role="list" ref={list} aria-label={props.label} {...listEvents}>
        <Bars days={days} current={current} say={say} on={on} />
      </ol>
      <div className="dk-status-tracker__caption" aria-hidden>{caption || ' '}</div>
      {summary != null ? <p className="dk-status-tracker__summary">{summary}</p> : null}
      {props.legend !== false ? (
        <ul className="dk-status-tracker__legend" role="list">
          {STATES.map((s) => <li key={s} className="dk-status-tracker__key" data-state={s}><span className="dk-status-tracker__swatch" aria-hidden />{wordOf(L, s)}</li>)}
        </ul>
      ) : null}
    </div>
  );
});
