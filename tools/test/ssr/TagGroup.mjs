// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  TagGroup: h(D.TagGroup, { label: 'Labels', items: [{ id: 'a', label: 'Design' }, { id: 'b', label: 'Bug' }], onRemove: () => {} }),
  TagGroupSelectable: h(D.TagGroup, { 'aria-label': 'Skills', items: [{ id: 'a', label: 'Writing' }, { id: 'b', label: 'Motion' }], selectionMode: 'multiple', defaultSelected: ['b'] }),
});
