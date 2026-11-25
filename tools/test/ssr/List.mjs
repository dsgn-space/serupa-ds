// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    List: h(D.List, null, h(D.ListItem, { title: 'Inbox', description: '3 new' })),
    ListLoadingItems: h(D.List, { loading: true, 'aria-label': 'Members' }, h(D.ListLoadingItems, { rows: 2, showDescription: true, leading: 'sm', label: 'Loading members' })),
    ListSelectable: h(D.List, { 'aria-label': 'Files', selectionMode: 'multiple', defaultSelected: ['a'] }, h(D.ListItem, { value: 'a', title: 'Notes.md' }), h(D.ListItem, { value: 'b', title: 'Plan.pdf' })),
    // On the server ListVirtualItems draws the first 20 rows, with an empty row below standing in for the rest.
    ListVirtualItems: h(D.List, { 'aria-label': 'Rows' }, h(D.ListVirtualItems, { count: 1000, renderItem: (i) => h(D.ListItem, { title: 'Row ' + (i + 1) }) })),
    ListSelectAll: h(D.ListSelectAll, { values: ['a', 'b'], selected: ['a'], onSelectedChange: () => {} }),
});
