// src/components/DataGrid/labels.ts
var en = {
  dataGridEdit: (column) => "Edit " + column,
  dataGridCopied: (count) => count === 1 ? "1 cell copied" : count + " cells copied",
  dataGridPasted: (count) => count === 1 ? "1 cell pasted" : count + " cells pasted",
  dataGridHint: "Arrow keys move between cells. Enter or F2 edits a cell, Escape cancels."
};
var id = {
  dataGridEdit: (column) => "Ubah " + column,
  dataGridCopied: (count) => count + " sel disalin",
  dataGridPasted: (count) => count + " sel ditempel",
  dataGridHint: "Tombol panah berpindah antarsel. Enter atau F2 mengubah sel, Escape membatalkan."
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
