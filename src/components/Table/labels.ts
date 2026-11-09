// Table's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TableLabels {
  /** Table's scroll region when it has no caption. */
  table: string;
  /** Table: read out when a sortable column's order changes ("Sorted by Amount, ascending"). */
  tableSorted: (column: string, direction: 'ascending' | 'descending') => string;
  /** TableActionBar: how many rows are selected, shown and read out ("3 selected"). */
  tableSelected: (count: number) => string;
  /** TableActionBar: the button that clears the selection. */
  clearSelection: string;
  /** TableHeaderCell resizable: the handle's name, given the column's name ("Resize Name column"). */
  tableResizeColumn: (column: string) => string;
  /** Table: the buttons in a resizable column's width popover, opened by a click or Enter on its handle. */
  tableNarrower: string;
  tableWider: string;
  /** Table: fits the column to its widest content. */
  tableFitColumn: string;
  /** Table: a resize handle's description, saying how to reach the width buttons. */
  tableResizeHint: string;
  /** TableColumnsMenu: the button that opens the choice of columns, and its panel's title. */
  tableColumns: string;
  /** TableExpandCell header: the expand column's heading, read only (it shows nothing). */
  tableDetails: string;
  /** TableExpandCell: the button that shows or hides a row's details, given the row's name ("Details, Order 1001"); aria-expanded says which. */
  tableRowDetails: (row: string) => string;
}
export const en: TableLabels = {
  table: 'Table',
  tableSorted: (column, direction) => 'Sorted by ' + column + ', ' + direction + '.',
  tableSelected: (n) => n + ' selected',
  clearSelection: 'Clear selection',
  tableResizeColumn: (column) => 'Resize ' + column + ' column',
  tableNarrower: 'Narrower',
  tableWider: 'Wider',
  tableFitColumn: 'Fit to content',
  tableResizeHint: 'Press Enter for width buttons',
  tableColumns: 'Columns',
  tableDetails: 'Details',
  tableRowDetails: (row) => 'Details, ' + row,
};
export const id: TableLabels = {
  table: 'Tabel',
  tableSorted: (column, direction) => 'Diurutkan menurut ' + column + ', ' + (direction === 'ascending' ? 'naik' : 'turun') + '.',
  tableSelected: (n) => n + ' dipilih',
  clearSelection: 'Hapus pilihan',
  tableResizeColumn: (column) => 'Ubah lebar kolom ' + column,
  tableNarrower: 'Lebih sempit',
  tableWider: 'Lebih lebar',
  tableFitColumn: 'Sesuaikan dengan isi',
  tableResizeHint: 'Tekan Enter untuk tombol lebar',
  tableColumns: 'Kolom',
  tableDetails: 'Rincian',
  tableRowDetails: (row) => 'Rincian ' + row,
};
