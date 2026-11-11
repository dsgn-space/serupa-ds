'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useOwnLang } from '../../internal/provider';
import { formatNumber, type NumberFormat } from './formatNumber';

export { formatNumber } from './formatNumber';
export type { FormatNumberOptions, NumberFormat } from './formatNumber';

export interface FormattedNumberProps extends Omit<React.DataHTMLAttributes<HTMLDataElement>, 'children' | 'value'> {
  /** The number. NaN renders an empty element. */
  value: number | bigint;
  /** 'decimal' (default), 'compact' (1.2K), 'percent' (0.45 is 45%), 'currency' (with currency), 'bytes' (1.5 MB) or 'unit' (with unit). */
  format?: NumberFormat | undefined;
  /** With format="currency": an ISO 4217 code, "IDR", "USD", "EUR". */
  currency?: string | undefined;
  /** With format="unit": a unit Intl knows, "kilometer-per-hour", "celsius", "liter". */
  unit?: string | undefined;
  /** Any other Intl.NumberFormat options (maximumFractionDigits, signDisplay, currencyDisplay...); these win. */
  options?: Intl.NumberFormatOptions | undefined;
  /** A locale for this one; otherwise the SerupaProvider's, else the browser's. */
  locale?: string | undefined;
  /** When the value changes, the characters that changed fade in out of a slight blur, so a reader sees what moved. */
  animate?: boolean | undefined;
}

/** Which characters of `next` differ from `prev`, lined up from the end so the ones, tens and the unit stay in their
 *  places when the number grows a digit ("Rp 9.500" to "Rp 10.500" marks "10"). Every character is new when there
 *  was nothing before. */
function changedChars(prev: string, next: string): boolean[] {
  const offset = prev.length - next.length;
  return Array.from(next, (c, i) => prev[i + offset] !== c);
}

/** `text` cut into runs of unchanged and changed characters; each changed run is a span keyed by the change. */
function segments(text: string, mask: boolean[], change: number): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < text.length;) {
    let j = i;
    while (j < text.length && mask[j] === mask[i]) j++;
    out.push(mask[i] ? <span key={`${change}-${i}`} className="dk-formatted-number__changed" data-changed="">{text.slice(i, j)}</span> : text.slice(i, j));
    i = j;
  }
  return out;
}

/* FormattedNumber: a <data value> holding the number for machines and the locale's words for people: 1.234,5 in
   Indonesian, ١٬٢٣٤٫٥ in Egyptian Arabic, "1.2K", "Rp 150.000", "45%", "1.5 MB", "50 km/h". A compact number
   carries the full one in its tooltip (title). */
/** A number written the way the reader's locale writes it: plain, compact, a percentage, money, a size or a unit. */
export const FormattedNumber = /* @__PURE__ */ component<HTMLDataElement, FormattedNumberProps>('FormattedNumber', function FormattedNumber(props, ref) {
  const rest = omit(props, { value: 1, format: 1, currency: 1, unit: 1, options: 1, locale: 1, className: 1, animate: 1 });
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const format = props.format || 'decimal';
  const text = formatNumber(props.value, locale, { format, currency: props.currency, unit: props.unit, ...props.options });
  // A compact number hides digits ("1.2K" for 1,234): the full one goes in its tooltip.
  const title = format === 'compact' && text ? formatNumber(props.value, locale) : undefined;
  // The last text shown and what changed in it. It moves on only when the text does, so a re-render with the same
  // value keeps the spans (and their animation) as they are; the first render, and the server's, is plain text.
  const last = React.useRef<{ text: string; mask: boolean[] | null; change: number } | null>(null);
  const seen = last.current;
  const now = !props.animate || !seen ? { text, mask: null, change: 0 }
    : seen.text === text ? seen : { text, mask: changedChars(seen.text, text), change: seen.change + 1 };
  // every render: it keeps what was shown last, which a re-render with a new value must compare against.
  React.useEffect(() => { last.current = now; });
  return <data lang={lang} {...rest} ref={ref} value={String(props.value)} title={rest.title ?? title} className={cn('dk-formatted-number', props.className)}
    data-component="formatted-number" data-format={format}>{now.mask ? segments(text, now.mask, now.change) : text}</data>;
});
