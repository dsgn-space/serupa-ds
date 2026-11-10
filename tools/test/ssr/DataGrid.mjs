// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  DataGrid: h(D.DataGrid, { 'aria-label': 'Stock', columns: [{ key: 'name', header: 'Name', editable: true }, { key: 'qty', header: 'Qty', align: 'end' }], rows: [{ id: 'a', name: 'Kopi', qty: 4 }, { id: 'b', name: 'Teh', qty: 9 }] }),
});
