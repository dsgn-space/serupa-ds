// ErrorSummary's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ErrorSummaryLabels {
  /** ErrorSummary: its heading, from how many errors it lists. `formatted` is the count in the locale's digits and
   *  grouping; `count` is there for plural rules. */
  errorSummaryTitle: (count: number, formatted: string) => string;
}
export const en: ErrorSummaryLabels = {
  errorSummaryTitle: (count, formatted = String(count)) => (count === 1 ? 'There is a problem' : 'There are ' + formatted + ' problems'),
};
export const id: ErrorSummaryLabels = {
  errorSummaryTitle: (count, formatted = String(count)) => (count === 1 ? 'Ada satu masalah' : 'Ada ' + formatted + ' masalah'),
};
