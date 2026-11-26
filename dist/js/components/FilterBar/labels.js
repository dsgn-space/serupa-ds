// src/components/FilterBar/labels.ts
var en = {
  filterBar: "Filters",
  filterAdd: "Add filter",
  filterClear: "Clear all",
  filterIs: (field, values) => field + " is " + values,
  filterContains: (field, text) => field + " contains \u201C" + text + "\u201D",
  filterFrom: (field, date) => field + " from " + date,
  filterUntil: (field, date) => field + " until " + date,
  filterAny: (field) => field + ": any",
  filterRemove: (field) => "Remove filter: " + field,
  filterDone: "Done",
  filterResults: (count, formatted = String(count)) => formatted + (count === 1 ? " result" : " results")
};
var id = {
  filterBar: "Filter",
  filterAdd: "Tambah filter",
  filterClear: "Hapus semua",
  filterIs: (field, values) => field + ": " + values,
  filterContains: (field, text) => field + " berisi \u201C" + text + "\u201D",
  filterFrom: (field, date) => field + " sejak " + date,
  filterUntil: (field, date) => field + " sampai " + date,
  filterAny: (field) => field + ": semua",
  filterRemove: (field) => "Hapus filter: " + field,
  filterDone: "Selesai",
  filterResults: (count, formatted = String(count)) => formatted + " hasil"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
