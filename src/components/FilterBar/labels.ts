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
  /** FilterBar: a date range with only a start ("Due: from Nov 2, 2026") or only an end ("Due: until Nov 8, 2026"). */
  filterFrom: (field: string, date: string) => string;
  filterUntil: (field: string, date: string) => string;
  /** FilterBar: a chip whose filter has nothing chosen yet. */
  filterAny: (field: string) => string;
  /** FilterBar: the button that removes one filter ("Remove filter: Status"). */
  filterRemove: (field: string) => string;
  /** FilterBar: the button that closes a filter's editor. */
  filterDone: string;
  /** FilterBar: how many results the filters leave, shown and announced. `formatted` is the count in the locale's
   *  digits and grouping; `count` is there for plural rules. */
  filterResults: (count: number, formatted: string) => string;
}
export const en: FilterBarLabels = {
  filterBar: 'Filters',
  filterAdd: 'Add filter',
  filterClear: 'Clear all',
  filterIs: (field, values) => field + ' is ' + values,
  filterContains: (field, text) => field + ' contains “' + text + '”',
  filterFrom: (field, date) => field + ' from ' + date,
  filterUntil: (field, date) => field + ' until ' + date,
  filterAny: (field) => field + ': any',
  filterRemove: (field) => 'Remove filter: ' + field,
  filterDone: 'Done',
  filterResults: (count, formatted = String(count)) => formatted + (count === 1 ? ' result' : ' results'),
};
export const id: FilterBarLabels = {
  filterBar: 'Filter',
  filterAdd: 'Tambah filter',
  filterClear: 'Hapus semua',
  filterIs: (field, values) => field + ': ' + values,
  filterContains: (field, text) => field + ' berisi “' + text + '”',
  filterFrom: (field, date) => field + ' sejak ' + date,
  filterUntil: (field, date) => field + ' sampai ' + date,
  filterAny: (field) => field + ': semua',
  filterRemove: (field) => 'Hapus filter: ' + field,
  filterDone: 'Selesai',
  filterResults: (count, formatted = String(count)) => formatted + ' hasil',
};
