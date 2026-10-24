// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    SortableList: h(D.SortableList, { 'aria-label': 'Tasks', items: ['A', 'B'], getKey: (i) => i, getLabel: (i) => i, renderItem: (i) => i, onReorder: () => {} }),
});
