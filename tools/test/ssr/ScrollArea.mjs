// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  ScrollArea: h(D.ScrollArea, { 'aria-label': 'Recent activity', style: { maxHeight: 80 } }, h('p', null, 'One'), h('p', null, 'Two'), h('p', null, 'Three')),
});
