// ShowMore's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ShowMoreLabels {
  /** ShowMore: the button that shows the rest of the text. */
  showMore: string;
  /** ShowMore: the same button once the text is open. */
  showLess: string;
}
export const en: ShowMoreLabels = {
  showMore: 'Show more',
  showLess: 'Show less',
};
export const id: ShowMoreLabels = {
  showMore: 'Tampilkan lebih banyak',
  showLess: 'Tampilkan lebih sedikit',
};
