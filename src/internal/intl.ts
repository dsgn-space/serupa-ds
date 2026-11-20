/* Intl formatters, made once for each locale and options and kept. Building one costs about as much as using it
   twenty times (a DateTimeFormat about 60µs, a format with it 3µs), and the parts that format in every render ran it
   on each: a Countdown each second, every RelativeTime in a list, every Chat message. Options are compared as JSON,
   so a literal written in a render finds the one made before. A locale the browser rejects still throws, and nothing
   is kept for it. */
type Ctor<F, O> = new (locales?: string | string[], options?: O) => F;
// module state: a cache by locale and options; formatters hold no request's data.
const made = new Map<string, unknown>();

function kept<F, O>(kind: string, C: Ctor<F, O>, locale: string | undefined, options: O | undefined): F {
  const key = kind + '|' + (locale || '') + '|' + (options ? JSON.stringify(options) : '');
  let f = made.get(key) as F | undefined;
  if (!f) {
    f = new C(locale, options);
    if (made.size >= 500) made.clear();   // a page that makes options without end (a time zone per row) can't grow it forever
    made.set(key, f);
  }
  return f;
}

export const numberFormat = (locale?: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat => kept('n', Intl.NumberFormat, locale, options);
export const dateFormat = (locale?: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => kept('d', Intl.DateTimeFormat, locale, options);
export const relativeFormat = (locale?: string, options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat => kept('r', Intl.RelativeTimeFormat, locale, options);
export const listFormat = (locale?: string, options?: Intl.ListFormatOptions): Intl.ListFormat => kept('l', Intl.ListFormat, locale, options);
