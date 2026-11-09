// FilterBar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface FilterBarLabels {
  /** FilterBar: the bar's name for screen readers, without aria-label. */
  filterBar: string;
  /** FilterBar: the button that opens the menu of fields, and the one that removes every filter. */
  filterAdd: string;
  filterClear: string;
  /** FilterBar: a chip: a field and its chosen values ("Status is Open or Closed"), already joined in the locale's words. */
  filterIs: (field: string, values: string) => string;
  /** FilterBar: a text filter's chip ("Name contains "ana""). */
  filterContains: (field: string, text: string) => string;
  /** FilterBar: a chip whose filter has nothing chosen yet. */
  filterAny: (field: string) => string;
  /** FilterBar: the button that removes one filter ("Remove filter: Status"). */
  filterRemove: (field: string) => string;
  /** FilterBar: the button that closes a filter's editor. */
  filterDone: string;
  /** FilterBar: how many results the filters leave, shown and announced. */
  filterResults: (count: number) => string;
}
export const en: FilterBarLabels = {
  filterBar: 'Filters',
  filterAdd: 'Add filter',
  filterClear: 'Clear all',
  filterIs: (field, values) => field + ' is ' + values,
  filterContains: (field, text) => field + ' contains “' + text + '”',
  filterAny: (field) => field + ': any',
  filterRemove: (field) => 'Remove filter: ' + field,
  filterDone: 'Done',
  filterResults: (count) => (count === 1 ? '1 result' : count + ' results'),
};
export const id: FilterBarLabels = {
  filterBar: 'Filter',
  filterAdd: 'Tambah filter',
  filterClear: 'Hapus semua',
  filterIs: (field, values) => field + ': ' + values,
  filterContains: (field, text) => field + ' berisi “' + text + '”',
  filterAny: (field) => field + ': semua',
  filterRemove: (field) => 'Hapus filter: ' + field,
  filterDone: 'Selesai',
  filterResults: (count) => count + ' hasil',
};
