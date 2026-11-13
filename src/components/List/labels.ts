// List's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ListLabels {
  /** ListSelectAll's label, the box that picks every row of a List with selectionMode. */
  listSelectAll: string;
}
export const en: ListLabels = { listSelectAll: 'Select all' };
export const id: ListLabels = { listSelectAll: 'Pilih semua' };
