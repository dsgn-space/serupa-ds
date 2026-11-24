// Unicode bidi isolation (U+2066 LRI, U+2067 RLI, U+2068 FSI, U+2069 PDI) so caller-supplied text
// (file names, tags, emails, column names) interpolated into translated strings doesn't scramble
// surrounding punctuation or numbers when its direction differs from the UI's.

const FSI = '\u2068', PDI = '\u2069';
const HAS_LTR = /[A-Za-z]/;
const HAS_RTL = /[\u0590-\u08FF\uFB1D-\uFEFC]/;

/** Text in an explicit direction of its own, isolated from what's around it (LRI/RLI…PDI); unchanged without one. */
export const isolate = (text: string, dir: 'ltr' | 'rtl' | undefined): string =>
  (dir ? (dir === 'rtl' ? '\u2067' : '\u2066') + text + PDI : text);

/** Isolates caller text with FSI…PDI when it carries strong characters of the opposite direction (for example a Latin
 *  file name inside Arabic UI, or an Arabic/Hebrew tag inside LTR UI). Same-script strings stay unchanged. */
export const bidi = (text: string, ui: 'ltr' | 'rtl' = 'ltr'): string =>
  (text && (ui === 'rtl' ? HAS_LTR.test(text) : HAS_RTL.test(text)) && !text.startsWith(FSI) ? FSI + text + PDI : text);
