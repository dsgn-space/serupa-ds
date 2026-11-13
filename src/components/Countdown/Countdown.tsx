'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { announce } from '../../internal/announce';
import { canonicalLocale } from '../../internal/locale';
import { useLocale, useOwnLang } from '../../internal/provider';
import { warnOnce } from '../../internal/warn';
import { countdownTick } from '../../internal/timing';

export interface CountdownProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'> {
  /** When it ends: a Date, a timestamp in ms, or a string Date can read ("2026-11-14T18:00:00Z"). It keeps its own
      clock from there. Pass this or `seconds`. */
  to?: Date | number | string | undefined;
  /** The time left, in seconds, when your app keeps the clock: a timer the server owns, or one that's paused. It shows
      this and doesn't tick; pass a new value as it changes, and it says the steps it crosses as `to` does. */
  seconds?: number | undefined;
  /** What it counts down to, in the page's language: "Offer ends in", "Time left". It names the timer, and starts
      each announcement ("Offer ends in: 5 minutes"). */
  label: string;
  /** 'clock' (default): "4:59", "1:04:59". 'words': "4 minutes, 59 seconds". */
  format?: 'clock' | 'words' | undefined;
  /** The times left, in seconds, at which it's said aloud, once each. Default: an hour, 30, 10, 5, 2 and 1 minutes,
      30 and 10 seconds. [] says nothing until it ends; the time left is always there to read. */
  announceAt?: readonly number[] | undefined;
  /** Shown in place of the time once it ends, and said aloud: "The offer has ended". Default: the time at zero. */
  endText?: string | undefined;
  /** Called once when it reaches zero, or as it mounts when `to` has already passed. */
  onEnd?: (() => void) | undefined;
  /** A locale for this one; otherwise the SerupaProvider's, else the browser's. */
  locale?: string | undefined;
}

const DEFAULT_STEPS = [3600, 1800, 600, 300, 120, 60, 30, 10];

/* One clock for every Countdown on the page: it ticks twice a second while any is mounted, so the seconds change
   on time and the countdowns on a page change together. */
// module state: the browser's one clock (subscribe starts it); a server render reads getServerNow instead.
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
const tick = () => { now = Date.now(); listeners.forEach((l) => l()); };
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) { tick(); timer = setInterval(tick, countdownTick); }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) { clearInterval(timer); timer = null; }
  };
}
const getNow = () => (timer ? now : (now = Date.now()));
const still = () => () => {};
// module state: the server's moment, renewed each second, so requests a second apart never share it.
let serverNow = -Infinity;
const getServerNow = () => { const t = Date.now(); if (t - serverNow > 1000 || t < serverNow) serverNow = t; return serverNow; };

type Unit = 'day' | 'hour' | 'minute' | 'second';
const parts = (seconds: number): Array<[number, Unit]> => {
  const s = Math.max(0, Math.round(seconds));
  return [[Math.floor(s / 86400), 'day'], [Math.floor(s / 3600) % 24, 'hour'], [Math.floor(s / 60) % 60, 'minute'], [s % 60, 'second']];
};
const loc = (locale?: string) => (locale ? canonicalLocale(locale) : undefined);

/** The time left as a clock, in the locale's digits: "4:59", "1:04:59", "50:00:00" (hours past a day keep counting). */
export function countdownClock(seconds: number, locale?: string): string {
  const s = Math.max(0, Math.round(seconds)), l = loc(locale);
  const one = new Intl.NumberFormat(l, { useGrouping: false }), two = new Intl.NumberFormat(l, { minimumIntegerDigits: 2, useGrouping: false });
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  return h ? `${one.format(h)}:${two.format(m)}:${two.format(sec)}` : `${one.format(m)}:${two.format(sec)}`;
}

/** The time left in words, in the locale's language: "4 minutes, 59 seconds", "2 days, 3 hours", "0 seconds". */
export function countdownWords(seconds: number, locale?: string): string {
  const l = loc(locale);
  const said = parts(seconds).filter(([n]) => n > 0).map(([n, unit]) => new Intl.NumberFormat(l, { style: 'unit', unit, unitDisplay: 'long' }).format(n));
  return said.length ? new Intl.ListFormat(l, { type: 'unit', style: 'long' }).format(said) : new Intl.NumberFormat(l, { style: 'unit', unit: 'second', unitDisplay: 'long' }).format(0);
}

/* Countdown: a <time role="timer"> that shows the time left until `to`, as a clock or in words, named by its label.
   It isn't a live region (a timer that speaks every second drowns out everything else): it says the time aloud at a
   few steps (announceAt), and when it ends. */
/** The time left until a moment, as a clock or in words; said aloud at a few steps, not every second. */
export const Countdown = /* @__PURE__ */ component<HTMLTimeElement, CountdownProps>('Countdown', function Countdown(props, ref) {
  const rest = omit(props, { to: 1, seconds: 1, label: 1, format: 1, announceAt: 1, endText: 1, onEnd: 1, locale: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  // With seconds, the app keeps the clock: nothing here ticks.
  const own = props.seconds === undefined;
  const current = React.useSyncExternalStore(own ? subscribe : still, getNow, getServerNow);
  const end = own && props.to !== undefined ? new Date(props.to).getTime() : NaN;
  const valid = own ? isFinite(end) : isFinite(props.seconds as number);
  const left = !valid ? 0 : own ? Math.max(0, Math.ceil((end - current) / 1000)) : Math.max(0, Math.round(props.seconds as number));
  const ended = valid && left === 0;
  const words = countdownWords(left, locale);
  const was = React.useRef<number | null>(null);
  const onEnd = React.useRef(props.onEnd);
  onEnd.current = props.onEnd;
  const { label, endText } = props;
  const steps = props.announceAt || DEFAULT_STEPS;

  React.useEffect(() => {   // in the browser only, once per page
    if (process.env.NODE_ENV !== 'production' && !valid) warnOnce('countdown-to', own
      ? 'Countdown: to ' + JSON.stringify(String(props.to)) + " isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, or a string Date can read, such as \"2026-11-14T18:00:00Z\", or the time left as seconds."
      : 'Countdown: seconds ' + JSON.stringify(String(props.seconds)) + " isn't a number, so it shows nothing.");
  }, [valid, own, props.to, props.seconds]);

  React.useEffect(() => {
    if (!valid) return;
    const before = was.current;
    was.current = left;
    if (left === 0) {
      if (before !== 0) {
        onEnd.current?.();
        // Said when it ends while someone's here, not when the page opens on a countdown that's long over.
        if (before !== null) announce(endText || `${label}: ${countdownWords(0, locale)}`);
      }
      return;
    }
    if (before === null || before <= left) return;
    // The smallest step crossed since the last tick: a tab that slept through several says only where it is now.
    const crossed = steps.filter((t) => t < before && t >= left);
    if (crossed.length) announce(`${label}: ${countdownWords(Math.min(...crossed), locale)}`);
  }, [left, valid, label, endText, locale, steps]);

  const text = !valid ? '' : ended && endText ? endText : props.format === 'words' ? words : countdownClock(left, locale);
  return <time lang={lang} {...rest} ref={ref} role="timer" aria-label={valid ? `${label}: ${ended && endText ? endText : words}` : label}
    dateTime={valid ? `PT${left}S` : undefined} className={cn('dk-countdown', ended && 'dk-countdown--ended', props.className)}
    data-component="countdown" suppressHydrationWarning>{text}</time>;
});
