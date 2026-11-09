// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  TableOfContents: h(D.TableOfContents, { items: [{ id: 'intro', label: 'Introduction' }, { id: 'npm', label: 'With npm', level: 3 }] }),
});
