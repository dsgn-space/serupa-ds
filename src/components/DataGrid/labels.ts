// DataGrid's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DataGridLabels {
  /** DataGrid: the name of the field a cell is edited in ("Edit Quantity"). */
  dataGridEdit: (column: string) => string;
  /** DataGrid: said after a copy ("3 cells copied"). */
  dataGridCopied: (count: number, formatted: string) => string;
  /** DataGrid: said after a paste ("6 cells pasted"). */
  dataGridPasted: (count: number, formatted: string) => string;
  /** DataGrid: the grid's description: how to edit, once, for screen readers. */
  dataGridHint: string;
}
export const en: DataGridLabels = {
  dataGridEdit: (column) => 'Edit ' + column,
  dataGridCopied: (count, formatted = String(count)) => formatted + (count === 1 ? ' cell copied' : ' cells copied'),
  dataGridPasted: (count, formatted = String(count)) => formatted + (count === 1 ? ' cell pasted' : ' cells pasted'),
  dataGridHint: 'Arrow keys move between cells. Enter or F2 edits a cell, Escape cancels.',
};
export const id: DataGridLabels = {
  dataGridEdit: (column) => 'Ubah ' + column,
  dataGridCopied: (count, formatted = String(count)) => formatted + ' sel disalin',
  dataGridPasted: (count, formatted = String(count)) => formatted + ' sel ditempel',
  dataGridHint: 'Tombol panah berpindah antarsel. Enter atau F2 mengubah sel, Escape membatalkan.',
};
