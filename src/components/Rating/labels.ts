// Rating's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface RatingLabels {
  /** Each Rating choice's name, for a value: "1 star", "3.5 stars". formatted is the value in the locale's digits. */
  ratingStars: (value: number, formatted: string) => string;
  /** A read-only Rating's name: "4.5 out of 5". formatted and formattedMax are the two in the locale's digits. */
  ratingValue: (value: number, max: number, formatted: string, formattedMax: string) => string;
}
export const en: RatingLabels = {
  ratingStars: (value, formatted = String(value)) => formatted + (value === 1 ? ' star' : ' stars'),
  ratingValue: (value, max, formatted = String(value), formattedMax = String(max)) => formatted + ' out of ' + formattedMax,
};
export const id: RatingLabels = {
  ratingStars: (value, formatted = String(value).replace('.', ',')) => formatted + ' bintang',
  ratingValue: (value, max, formatted = String(value).replace('.', ','), formattedMax = String(max)) => formatted + ' dari ' + formattedMax,
};
