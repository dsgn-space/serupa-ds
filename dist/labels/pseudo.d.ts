import type { SerupaLabels } from "../index.js";
/** Every built-in word, in this language: <SerupaProvider locale={locale} labels={labels}>. */
export declare const labels: SerupaLabels;
/** The locale the words are written for. */
export declare const locale: string;
/** Pseudo text: accented, about 40% longer, between ⟦ ⟧, for an app's own words beside these labels. */
export declare function pseudo(text: string): string;
/** A whole label set in the pseudo-locale, the text each function label is given left as it was. */
export declare function pseudoLabels<T extends object>(labels: T): T;
