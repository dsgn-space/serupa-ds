// DataGrid's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DataGridLabels {
  /** DataGrid: the name of the field a cell is edited in ("Edit Quantity"). */
  dataGridEdit: (column: string) => string;
  /** DataGrid: said after a copy ("3 cells copied"). */
  dataGridCopied: (count: number) => string;
  /** DataGrid: said after a paste ("6 cells pasted"). */
  dataGridPasted: (count: number) => string;
  /** DataGrid: the grid's description: how to edit, once, for screen readers. */
  dataGridHint: string;
}
export const en: DataGridLabels = {
  dataGridEdit: (column) => 'Edit ' + column,
  dataGridCopied: (count) => (count === 1 ? '1 cell copied' : count + ' cells copied'),
  dataGridPasted: (count) => (count === 1 ? '1 cell pasted' : count + ' cells pasted'),
  dataGridHint: 'Arrow keys move between cells. Enter or F2 edits a cell, Escape cancels.',
};
export const id: DataGridLabels = {
  dataGridEdit: (column) => 'Ubah ' + column,
  dataGridCopied: (count) => count + ' sel disalin',
  dataGridPasted: (count) => count + ' sel ditempel',
  dataGridHint: 'Tombol panah berpindah antarsel. Enter atau F2 mengubah sel, Escape membatalkan.',
};
