// Pagination's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface PaginationLabels {
  /** Pagination. */
  pagination: string;
  previousPage: string;
  nextPage: string;
}
export const en: PaginationLabels = {
  pagination: "Pagination",
  previousPage: "Previous page",
  nextPage: "Next page",
};
export const id: PaginationLabels = {
  pagination: "Halaman",
  previousPage: "Halaman sebelumnya",
  nextPage: "Halaman berikutnya",
};
