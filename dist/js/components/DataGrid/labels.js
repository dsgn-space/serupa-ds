// src/components/DataGrid/labels.ts
var en = {
  dataGridEdit: (column) => "Edit " + column,
  dataGridCopied: (count, formatted = String(count)) => formatted + (count === 1 ? " cell copied" : " cells copied"),
  dataGridPasted: (count, formatted = String(count)) => formatted + (count === 1 ? " cell pasted" : " cells pasted"),
  dataGridHint: "Arrow keys move between cells. Enter or F2 edits a cell, Escape cancels."
};
var id = {
  dataGridEdit: (column) => "Ubah " + column,
  dataGridCopied: (count, formatted = String(count)) => formatted + " sel disalin",
  dataGridPasted: (count, formatted = String(count)) => formatted + " sel ditempel",
  dataGridHint: "Tombol panah berpindah antarsel. Enter atau F2 mengubah sel, Escape membatalkan."
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
