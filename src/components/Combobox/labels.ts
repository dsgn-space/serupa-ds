// Combobox's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ComboboxLabels {
  /** Combobox while loading options. */
  loadingResults: string;
  /** Combobox when nothing matches. */
  noResults: string;
}
export const en: ComboboxLabels = {
  loadingResults: "Loading…",
  noResults: "No results",
};
export const id: ComboboxLabels = {
  loadingResults: "Memuat…",
  noResults: "Tidak ada hasil",
};
