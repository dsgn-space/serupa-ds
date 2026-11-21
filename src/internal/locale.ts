/* Every Intl constructor throws RangeError on a locale it can't parse, which would unmount the tree. "en_US" is the
   common one (a server's LANG, Java's Locale.toString), so "_" becomes "-" first; whatever still fails gives undefined. */

// module state: each locale string's answer, kept, since checking one builds a list; it holds no request's data, only
// whether a string is a locale, so every request can share it.
const checked = new Map<string, string | undefined>();

/** The locale in canonical BCP 47 form ("en_US" and "EN-us" are "en-US"), or undefined when Intl can't use it. */
export function canonicalLocale(locale: string): string | undefined {
  if (checked.has(locale)) return checked.get(locale);
  let ok: string | undefined;
  try { ok = Intl.getCanonicalLocales(locale.trim().replace(/_/g, '-'))[0]; } catch { ok = undefined; }
  if (checked.size > 100) checked.clear();
  checked.set(locale, ok);
  return ok;
}

// Languages written right to left, for browsers without Intl.Locale's text info (Firefox): Arabic, Hebrew, Persian,
// Urdu, Pashto, Sindhi, Uyghur, Yiddish, Dhivehi, Central Kurdish, and a locale that names an RTL script.
const RTL = /^(ar|he|iw|fa|ur|ps|sd|ug|yi|dv|ckb)(-|$)|-(Arab|Hebr|Thaa|Syrc|Nkoo|Adlm|Rohg)(-|$)/i;

/** Which way a locale's text runs, so an element in its own locale carries the direction with its lang: "rtl" for
 *  ar-EG or he, "ltr" for en or id, undefined when Intl can't use the locale. */
export function localeDir(locale: string): 'ltr' | 'rtl' | undefined {
  const l = canonicalLocale(locale);
  if (!l) return undefined;
  try {
    const it = new Intl.Locale(l) as Intl.Locale & { getTextInfo?: () => { direction?: string }; textInfo?: { direction?: string } };
    const dir = (it.getTextInfo?.() ?? it.textInfo)?.direction;
    if (dir === 'rtl' || dir === 'ltr') return dir;
  } catch { /* the pattern below */ }
  return RTL.test(l) ? 'rtl' : 'ltr';
}
