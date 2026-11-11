// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Table: h(D.Table, null, h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Name'))), h(D.TableBody, null, h(D.TableRow, null, h(D.TableSelectCell, { label: 'Select Ada' }), h(D.TableCell, null, 'Ada'))), h(D.TableFoot, null, h(D.TableRow, null, h(D.TableCell, null, '1')))),
    // On the server it draws the first 20 rows, with an empty row below standing in for the rest.
    TableVirtualBody: h(D.Table, null, h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Invoice'))), h(D.TableVirtualBody, { count: 1000, renderRow: (i) => h(D.TableRow, null, h(D.TableCell, null, 'INV-' + (1001 + i))) })),
    TableActionBar: h(D.TableActionBar, { count: 2, onClear() {} }, h(D.Button, { size: 'sm' }, 'Export')),
    TableColumnsMenu: h(D.TableColumnsMenu, { columns: [{ id: 'name', label: 'Name', visible: true, required: true }, { id: 'email', label: 'Email', visible: false }], onColumnsChange() {} }),
    TableDetailRow: h(D.Table, null, h(D.TableBody, null, h(D.TableRow, null, h(D.TableExpandCell, { label: 'Order 1', expanded: true, controls: 'order-1', onExpandedChange() {} }), h(D.TableCell, null, 'Ada')), h(D.TableDetailRow, { id: 'order-1', open: true, colSpan: 2 }, 'Paid by card'))),
    // Loading: placeholder rows, named once, with aria-busy on the table; then a message row across the columns.
    TableLoadingRows: h(D.Table, { busy: true }, h(D.TableHead, null, h(D.TableRow, null, h(D.TableHeaderCell, null, 'Name'), h(D.TableHeaderCell, null, 'Role'))), h(D.TableLoadingRows, { columns: 2, rows: 2, label: 'Loading people' })),
    TableMessageRow: h(D.Table, null, h(D.TableBody, null, h(D.TableMessageRow, { colSpan: 2 }, 'No people yet'))),
});
