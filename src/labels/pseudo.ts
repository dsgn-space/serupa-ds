// serupa-ds/labels/pseudo: every built-in word in the pseudo-locale, accented, about 40% longer and between ⟦ ⟧, to
// check a layout holds a longer language and that no word was left in the code in English, before any translation.
//   import { labels, locale, pseudo } from "@diki-stwn/serupa-ds/labels/pseudo";
//   <SerupaProvider locale={locale} labels={labels}>   and pseudo("Your own words") for an app's own text
import { DEFAULT_LABELS } from '../internal/labels';
import { pseudoLabels } from '../internal/pseudo';
export { pseudo, pseudoLabels } from '../internal/pseudo';

/** The locale the words are written for: en-XA, the pseudo-locale tag for accented, longer English. Dates and numbers
 *  come out as in English. */
export const locale = 'en-XA';

export const labels = /* @__PURE__ */ pseudoLabels(DEFAULT_LABELS);
