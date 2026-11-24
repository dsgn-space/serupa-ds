'use client';
import * as React from 'react';
import { cn, omit, oneOf } from '../../internal/cn';
import { named } from '../../internal/component';
import { canonicalLocale, localeDir } from '../../internal/locale';
import { useLocale, useOwnLang } from '../../internal/provider';

/** A unit a duration is given in or written down to. */
export type DurationUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day';
/** How it's written: 'long' ("1 hour, 30 minutes"), 'short' ("1 hr, 30 min"), 'narrow' ("1h 30m") or 'digital' ("1:30:00"). */
export type DurationDisplay = 'long' | 'short' | 'narrow' | 'digital';

export interface FormatDurationOptions {
  /** The unit `value` is in. Default: 'second'. */
  unit?: DurationUnit | undefined;
  /** Default: 'short'. */
  display?: DurationDisplay | undefined;
  /** The finest unit shown; the rest is rounded to it. Default: the unit given ('second' for milliseconds, 'minute' for hours and days, so 1.5 hours is "1 hr, 30 min"). */
  smallest?: Exclude<DurationUnit, 'millisecond'> | undefined;
  /** The biggest unit shown; more of it keeps counting ("36 hours" with 'hour'). Default: 'day'; with 'digital', 'hour',
   *  left out under an hour ("0:45"), and said outright it's kept ("0:00:45"). */
  largest?: Exclude<DurationUnit, 'millisecond'> | undefined;
}

export interface DurationProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'>, FormatDurationOptions {
  /** How long, in `unit` (seconds unless said otherwise). A negative one is written as its size; NaN renders an empty element. */
  value: number;
  /** A locale for this one; otherwise the SerupaProvider's, else the browser's. */
  locale?: string | undefined;
}

const UNITS = ['day', 'hour', 'minute', 'second'] as const;
type Unit = (typeof UNITS)[number];
const SECONDS: Record<DurationUnit, number> = { millisecond: 0.001, second: 1, minute: 60, hour: 3600, day: 86400 };
const ISO: Record<Unit, string> = { day: 'D', hour: 'H', minute: 'M', second: 'S' };

// The duration split into the units from largest to smallest, rounded to smallest: [[1, 'hour'], [30, 'minute']].
function split(value: number, o: FormatDurationOptions): Array<[number, Unit]> {
  const unit = o.unit && o.unit in SECONDS ? o.unit : 'second';
  const digital = o.display === 'digital';
  const smallest = oneOf(UNITS, o.smallest, unit === 'millisecond' ? 'second' : unit === 'hour' || unit === 'day' ? 'minute' : unit);
  const largest = oneOf(UNITS, o.largest, digital ? 'hour' : 'day');
  const from = UNITS.indexOf(largest), to = Math.max(from, UNITS.indexOf(smallest));
  let left = Math.round(Math.abs(value) * SECONDS[unit] / SECONDS[UNITS[to]!]) * SECONDS[UNITS[to]!];
  const out: Array<[number, Unit]> = [];
  for (let i = from; i <= to; i++) {
    const u = UNITS[i]!, n = Math.floor(left / SECONDS[u]);
    left -= n * SECONDS[u];
    out.push([n, u]);
  }
  // A clock under an hour starts at the minutes, as a media player writes it ("0:45", "12:04"), unless largest asks for hours.
  if (digital && !o.largest && out.length > 2 && out[0]![0] === 0) out.shift();
  return out;
}

/** A duration in the locale's words or as a clock: formatDuration(5400) is "1 hr, 30 min", { display: 'long' }
 *  "1 hour, 30 minutes", { display: 'digital' } "1:30:00". Units that are 0 are left out of the words; a duration
 *  of 0 is "0" of the smallest unit. "" for a value that isn't a number.
 *  @beta New with Duration. */
export function formatDuration(value: number, locale?: string, options: FormatDurationOptions = {}): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  const l = locale ? canonicalLocale(locale) : undefined;
  const parts = split(value, options);
  const display = oneOf(['long', 'short', 'narrow', 'digital'] as const, options.display, 'short');
  if (display === 'digital') {
    const one = new Intl.NumberFormat(l, { useGrouping: false }), two = new Intl.NumberFormat(l, { minimumIntegerDigits: 2, useGrouping: false });
    return parts.map(([n], i) => (i ? two : one).format(n)).join(':');
  }
  const word = (n: number, u: Unit) => new Intl.NumberFormat(l, { style: 'unit', unit: u, unitDisplay: display }).format(n);
  const said = parts.filter(([n]) => n > 0).map(([n, u]) => word(n, u));
  const last = parts[parts.length - 1]!;
  return said.length ? new Intl.ListFormat(l, { type: 'unit', style: display }).format(said) : word(0, last[1]);
}

/** The same duration for machines: an ISO 8601 duration, "PT1H30M", "P2DT3H", "PT0S". */
export function isoDuration(value: number, options: Pick<FormatDurationOptions, 'unit' | 'smallest'> = {}): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  const parts = split(value, { ...options, largest: 'day' }).filter(([n]) => n > 0);
  const days = parts.filter(([, u]) => u === 'day').map(([n]) => n + 'D').join('');
  const time = parts.filter(([, u]) => u !== 'day').map(([n, u]) => n + ISO[u]).join('');
  return 'P' + days + (time ? 'T' + time : days ? '' : 'T0S');
}

function DurationRender({ ref, ...props }: DurationProps & React.RefAttributes<HTMLTimeElement>) {
  const rest = omit(props, { value: 1, unit: 1, display: 1, smallest: 1, largest: 1, locale: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const o = { unit: props.unit, display: props.display, smallest: props.smallest, largest: props.largest };
  const text = formatDuration(props.value, locale, o);
  // A clock ("1:30:00") reads as a time of day to a screen reader, so its name says the duration in words.
  const digital = props.display === 'digital' && !!text;
  // Shown, each unit's number and word stay together ("1\u00a0hr"), so words wrap only between units.
  const shown = digital ? text : text.replace(/(?<=\d) /g, '\u00a0');
  // A locale of its own brings its direction with its lang, so "1 hr, 15 min" in a right-to-left page doesn't read
  // "hr, 15 min 1" (its number is a weak character that would follow the page's direction).
  return <time lang={lang} dir={props.locale ? localeDir(props.locale) : undefined} {...rest} ref={ref} dateTime={isoDuration(props.value, o) || undefined}
    className={cn('srp-duration', digital && 'srp-duration--digital', props.className)} data-component="duration">
    {digital ? <><span aria-hidden="true">{shown}</span><span className="srp-visually-hidden">{formatDuration(props.value, locale, { ...o, display: 'long' })}</span></> : shown}
  </time>;
}

/* Duration: a <time datetime="PT1H30M"> holding how long something takes, in the reader's locale: "1 hr, 30 min",
   "1 jam, 30 menit", "1 hour, 30 minutes", "1h 30m" or "1:30:00". The same words in every browser (Intl.NumberFormat
   units joined by Intl.ListFormat), so the server's text is the browser's. A clock carries the words as its name. */
/** How long something takes or took, written the way the reader's locale writes it: a recipe's prep, a lesson, a video, a timesheet's total. */
export const Duration = /* @__PURE__ */ named('Duration', DurationRender);
