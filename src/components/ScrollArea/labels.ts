// ScrollArea's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ScrollAreaLabels {
  /** ScrollArea: the scrolling box's name while it scrolls, when it's given no aria-label or aria-labelledby. */
  scrollArea: string;
}
export const en: ScrollAreaLabels = {
  scrollArea: 'Scrolling content',
};
export const id: ScrollAreaLabels = {
  scrollArea: 'Konten bergulir',
};
