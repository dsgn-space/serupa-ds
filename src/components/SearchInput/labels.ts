// SearchInput's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface SearchInputLabels {
  /** SearchInput while loading. */
  searching: string;
  /** SearchInput clear button. */
  clearSearch: string;
}
export const en: SearchInputLabels = {
  searching: "Searching",
  clearSearch: "Clear search",
};
export const id: SearchInputLabels = {
  searching: "Mencari",
  clearSearch: "Hapus pencarian",
};
