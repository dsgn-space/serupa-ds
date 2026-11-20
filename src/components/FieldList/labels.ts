// FieldList's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label. A row's Remove button and
// what's said when a row comes or goes borrow TagGroup's and Combobox's words ("Remove Phone 2", "Phone 2 added").
export interface FieldListLabels {
  /** FieldList: why Add is unavailable once the list has max rows, with the limit in the locale's digits. */
  fieldListLimit: (max: string) => string;
}
export const en: FieldListLabels = {
  fieldListLimit: (max) => 'Limit reached: ' + max + '.',
};
export const id: FieldListLabels = {
  fieldListLimit: (max) => 'Batas tercapai: ' + max + '.',
};
