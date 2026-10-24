// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    List: h(D.List, null, h(D.ListItem, { title: 'Inbox', description: '3 new' })),
});
