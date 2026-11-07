// TableOfContents's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TableOfContentsLabels {
  /** TableOfContents: its title, and its navigation landmark's name. */
  tocTitle: string;
}
export const en: TableOfContentsLabels = {
  tocTitle: 'On this page',
};
export const id: TableOfContentsLabels = {
  tocTitle: 'Di halaman ini',
};
