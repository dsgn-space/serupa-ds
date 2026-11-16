// src/components/Table/labels.ts
var en = {
  table: "Table",
  tableSorted: (column, direction) => "Sorted by " + column + ", " + direction + ".",
  tableSelected: (count, formatted = String(count)) => formatted + " selected",
  clearSelection: "Clear selection",
  tableSelectAll: (count, formatted = String(count)) => "Select all " + formatted,
  tableAllSelected: (count, formatted = String(count)) => "All " + formatted + " selected",
  tableResizeColumn: (column) => "Resize " + column + " column",
  tableNarrower: "Narrower",
  tableWider: "Wider",
  tableFitColumn: "Fit to content",
  tableResizeHint: "Press Enter for width buttons",
  tableColumns: "Columns",
  tableDetails: "Details",
  tableRowDetails: (row) => "Details, " + row
};
var id = {
  table: "Tabel",
  tableSorted: (column, direction) => "Diurutkan menurut " + column + ", " + (direction === "ascending" ? "naik" : "turun") + ".",
  tableSelected: (count, formatted = String(count)) => formatted + " dipilih",
  clearSelection: "Hapus pilihan",
  tableSelectAll: (count, formatted = String(count)) => "Pilih semua " + formatted,
  tableAllSelected: (count, formatted = String(count)) => "Semua " + formatted + " dipilih",
  tableResizeColumn: (column) => "Ubah lebar kolom " + column,
  tableNarrower: "Lebih sempit",
  tableWider: "Lebih lebar",
  tableFitColumn: "Sesuaikan dengan isi",
  tableResizeHint: "Tekan Enter untuk tombol lebar",
  tableColumns: "Kolom",
  tableDetails: "Rincian",
  tableRowDetails: (row) => "Rincian " + row
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
