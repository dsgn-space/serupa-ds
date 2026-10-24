// Table's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TableLabels {
  /** Table's scroll region when it has no caption. */
  table: string;
}
export const en: TableLabels = {
  table: "Table",
};
export const id: TableLabels = {
  table: "Tabel",
};
