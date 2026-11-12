// src/components/Combobox/labels.ts
var en = {
  loadingResults: "Loading\u2026",
  loadFailed: "Couldn\u2019t load options. Type to try again.",
  noResults: "No results. Try other words.",
  resultsCount: (count, formatted = String(count)) => formatted + (count === 1 ? " result" : " results"),
  showOptions: "Show options",
  clearValue: (label) => label ? "Clear " + label : "Clear",
  createOption: (text) => "Add \u201C" + text + "\u201D",
  valueAdded: (label) => label + " added",
  valueRemoved: (label) => label + " removed"
};
var id = {
  loadingResults: "Memuat\u2026",
  loadFailed: "Gagal memuat pilihan. Ketik untuk mencoba lagi.",
  noResults: "Tidak ada hasil. Coba kata lain.",
  resultsCount: (count, formatted = String(count)) => formatted + " hasil",
  showOptions: "Tampilkan pilihan",
  clearValue: (label) => label ? "Hapus " + label : "Hapus",
  createOption: (text) => "Tambahkan \u201C" + text + "\u201D",
  valueAdded: (label) => label + " ditambahkan",
  valueRemoved: (label) => label + " dihapus"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
