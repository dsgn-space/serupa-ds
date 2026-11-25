'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { canonicalLocale, localeDir } from '../../internal/locale';
import { useLocale, useOwnLang } from '../../internal/provider';
import { warnOnce } from '../../internal/warn';

/** A moment or a day: a Date, a timestamp in ms, an ISO date and time ("2026-11-20T09:30:00Z"), or a plain
 *  "yyyy-mm-dd" day, which is that calendar day wherever it's read. */
export type DateValue = Date | number | string;

export interface FormatDateOptions {
  /** Where it ends: written as a range with the parts both share said once ("Nov 20 – 22, 2026"). */
  to?: DateValue | undefined;
  /** How much of the date: 'full' ("Friday, November 20, 2026"), 'long' ("November 20, 2026"), 'medium' (default,
   *  "Nov 20, 2026"), 'short' ("11/20/26"), or false for none (a time on its own). */
  dateStyle?: 'full' | 'long' | 'medium' | 'short' | false | undefined;
  /** The time of day too: 'short' ("9:30 AM"), 'medium' ("9:30:00 AM"), 'long' and 'full' (with the time zone).
   *  None by default. A "yyyy-mm-dd" day has no time, so it's left out there. */
  timeStyle?: 'full' | 'long' | 'medium' | 'short' | undefined;
  /** The IANA time zone it's written in ("Asia/Jakarta"). Default: the reader's. */
  timeZone?: string | undefined;
  /** Any other Intl.DateTimeFormat option. With one of the parts (weekday, year, month, day, hour, minute, second…),
   *  these write it alone and dateStyle and timeStyle are left out, as Intl asks. */
  options?: Intl.DateTimeFormatOptions | undefined;
}

export interface FormattedDateProps extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, 'children' | 'dateTime'>, FormatDateOptions {
  /** The moment or the day. One that can't be read renders an empty element, with a warning in development. */
  value: DateValue;
  /** A locale for this one; otherwise the SerupaProvider's, else the browser's. */
  locale?: string | undefined;
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const PARTS = ['weekday', 'era', 'year', 'month', 'day', 'dayPeriod', 'hour', 'minute', 'second', 'fractionalSecondDigits', 'timeZoneName'] as const;

interface Read { date: Date; day: boolean; iso: string }
// A day is held at UTC midnight and written in UTC, so "2026-11-20" is the 20th on every server and in every zone.
function read(v: unknown): Read | null {
  if (typeof v === 'string' && DAY.test(v.trim())) {
    const [, y, m, d] = DAY.exec(v.trim())!.map(Number) as [number, number, number, number];
    const date = new Date(Date.UTC(2000, m - 1, d)); date.setUTCFullYear(y);
    return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? { date, day: true, iso: v.trim() } : null;
  }
  const date = v instanceof Date ? v : typeof v === 'number' || typeof v === 'string' ? new Date(v) : null;
  return date && !isNaN(date.getTime()) ? { date, day: false, iso: date.toISOString() } : null;
}

// The Intl options for one value: the styles, or the caller's parts alone; a day in UTC and never with a time.
function intlOptions(day: boolean, o: FormatDateOptions, zone: string | undefined): Intl.DateTimeFormatOptions {
  const own = o.options || {};
  const parts = PARTS.some((p) => own[p] !== undefined);
  const styles: Intl.DateTimeFormatOptions = parts ? {} : {
    dateStyle: o.dateStyle === false ? undefined : o.dateStyle || 'medium',
    timeStyle: day ? undefined : o.timeStyle,
  };
  if (!parts && !styles.dateStyle && !styles.timeStyle) styles.dateStyle = 'medium';
  const out: Intl.DateTimeFormatOptions = { ...styles, ...own, timeZone: day ? 'UTC' : o.timeZone ?? own.timeZone ?? zone };
  if (day) for (const p of ['hour', 'minute', 'second', 'dayPeriod', 'fractionalSecondDigits', 'timeZoneName'] as const) delete out[p];
  return out;
}

// The formatter, or the plain medium date when the options are ones Intl rejects (a zone it doesn't know), so a
// typo writes a date rather than throwing and unmounting the page.
function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions, day: boolean): Intl.DateTimeFormat {
  try { return new Intl.DateTimeFormat(locale, options); }
  catch (e) {
    if (process.env.NODE_ENV !== 'production') warnOnce('date-options', `FormattedDate: ${(e as Error).message}, so it's written as a medium date. Check timeZone and options.`);
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: day ? 'UTC' : undefined });
  }
}

// A time and its AM or PM stay on one line ("11:45 AM", "오후 3:00"): where Intl puts a breaking space between them
// (older ICU does; newer writes a narrow no-break space), it becomes a no-break space. Found by part type, so it holds in every locale.
// module state: a fixed list of Intl part types, never written to, so every request reads the same one.
const CLOCK = new Set(['hour', 'minute', 'second', 'fractionalSecond']);
function keepTimeTogether<T extends { type: string; value: string }>(parts: T[]): T[] {
  return parts.map((p, i) => {
    const before = parts[i - 1]?.type, after = parts[i + 1]?.type;
    const joins = p.type === 'literal' && /^[^\S\u00a0\u202f]+$/.test(p.value) && ((CLOCK.has(before!) && after === 'dayPeriod') || (before === 'dayPeriod' && CLOCK.has(after!)));
    return joins ? { ...p, value: '\u00a0' } : p;
  });
}

// A date with a time wraps between the two, never inside either: "Nov 12, 2026, / 8:00 AM", not "Nov 12, / 2026,
// 8:00 AM". The words are the same (textContent and formatDate don't change): [first half, the words between, second half].
// Each half keeps to one line (FormattedDate.css). Only short halves, as the short and medium styles write them: a
// long one ("Wednesday, September 30, 2026") could be wider than a narrow line, so it wraps like a sentence.
// module state: a fixed list of Intl part types, never written to, so every request reads the same one.
const TIME = new Set(['hour', 'minute', 'second', 'fractionalSecond', 'dayPeriod', 'timeZoneName']);
function halves(parts: { type: string; value: string }[]): string[] {
  const a = parts.findIndex((p) => p.type !== 'literal');
  const cut = parts.findIndex((p, n) => n > a && p.type !== 'literal' && TIME.has(p.type) !== TIME.has(parts[a]!.type));
  if (cut < 0) return [];
  let b = cut;
  while (parts[b - 1]!.type === 'literal') b--;
  const text = (x: typeof parts) => x.map((p) => p.value).join('');
  const out = [text(parts.slice(0, b)), text(parts.slice(b, cut)), text(parts.slice(cut))];
  return out[0]!.length > 20 || out[2]!.length > 20 ? [] : out;
}

type Piece = { text: string; source: 'startRange' | 'endRange' | 'shared' };
function pieces(value: unknown, locale: string | undefined, o: FormatDateOptions, zone?: string): { from: Read; to: Read | null; pieces: Piece[]; runs: string[] } | null {
  const from = read(value);
  if (!from) return null;
  const end = o.to === undefined ? null : read(o.to);
  // A range of days takes its end as a day too, so "2026-11-20" to a Date is still a range of days.
  const to = end && from.day && !end.day ? read(`${end.date.getFullYear()}-${String(end.date.getMonth() + 1).padStart(2, '0')}-${String(end.date.getDate()).padStart(2, '0')}`) : end;
  const f = formatter(locale ? canonicalLocale(locale) : undefined, intlOptions(from.day, o, zone), from.day);
  const parts = keepTimeTogether(to ? f.formatRangeToParts(from.date, to.date) : f.formatToParts(from.date).map((p) => ({ ...p, source: 'shared' as const })));
  const out: Piece[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.source === p.source) last.text += p.value;
    else out.push({ text: p.value, source: p.source });
  }
  return { from, to, pieces: out, runs: to ? [] : halves(parts) };
}

/** A date, a time or a range in the locale's words: formatDate("2026-11-20") is "Nov 20, 2026",
 *  { dateStyle: 'long', timeStyle: 'short' } "November 20, 2026 at 9:30 AM", { to: "2026-11-22" } "Nov 20 – 22, 2026".
 *  A "yyyy-mm-dd" day is that day in every time zone. "" for a value it can't read.
 *  @beta New with FormattedDate. */
export function formatDate(value: DateValue, locale?: string, options: FormatDateOptions = {}): string {
  return pieces(value, locale, options)?.pieces.map((p) => p.text).join('') ?? '';
}

const never = () => () => {};
const inBrowser = () => true, onServer = () => false;

function FormattedDateRender({ ref, ...props }: FormattedDateProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { value: 1, to: 1, dateStyle: 1, timeStyle: 1, timeZone: 1, options: 1, locale: 1, className: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  // The server can't know the reader's time zone, so a moment with none given is written in UTC there and while
  // hydrating (the same text, no mismatch), then in the reader's zone right after. Days and a given timeZone don't move.
  const browser = React.useSyncExternalStore(never, inBrowser, onServer);
  const o = { to: props.to, dateStyle: props.dateStyle, timeStyle: props.timeStyle, timeZone: props.timeZone, options: props.options };
  const made = pieces(props.value, locale, o, browser ? undefined : 'UTC');
  const invalid = !made;
  React.useEffect(() => {   // in the browser only, once per page
    if (process.env.NODE_ENV !== 'production' && invalid) warnOnce('date-value', `FormattedDate: ${JSON.stringify(String(props.value))} isn't a date, so it shows nothing. Pass a Date, a timestamp in ms, an ISO date and time, or a "yyyy-mm-dd" day.`);
  }, [invalid, props.value]);
  const cls = cn('srp-formatted-date', props.className);
  // A locale of its own brings its direction with its lang, so "Nov 20, 2026" in a right-to-left page keeps its order.
  const dir = props.locale ? localeDir(props.locale) : undefined;
  // The server's ICU and the browser's can space or join the same date a little differently ("Nov 20 – 22" with a
  // thin space or a plain one); the browser re-renders right after hydrating (browser above), so its words win.
  // A range: one <time> for the start's own words and one for the end's, with the words both share between them.
  if (made?.to && made.pieces.some((p) => p.source !== 'shared')) {
    return <span lang={lang} dir={dir} {...rest} ref={ref} className={cls} data-component="formatted-date" suppressHydrationWarning>
      {made.pieces.map((p, i) => p.source === 'shared' ? p.text : <time key={i} dateTime={(p.source === 'startRange' ? made.from : made.to!).iso} suppressHydrationWarning>{p.text}</time>)}
    </span>;
  }
  return <time lang={lang} dir={dir} {...rest} ref={ref as React.Ref<HTMLTimeElement>} dateTime={made?.from.iso} className={cls} data-component="formatted-date" suppressHydrationWarning>
    {made?.runs.length ? made.runs.map((r, i) => (i === 1 ? r : <span key={i} className="srp-formatted-date__half">{r}</span>)) : made?.pieces[0]?.text}
  </time>;
}

/* FormattedDate: a <time datetime> holding a date, a time or a range in the reader's locale, by Intl.DateTimeFormat.
   A "yyyy-mm-dd" day is that day everywhere; a moment is the reader's own time once the page is in the browser. */
/** A date, a time or a range of them, written the way the reader's locale writes it: a due date, an order's day, an event's dates. */
export const FormattedDate = /* @__PURE__ */ named('FormattedDate', FormattedDateRender);
