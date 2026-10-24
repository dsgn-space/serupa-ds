// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Layout: h(D.Container, null, h(D.Stack, { gap: 4 }, h(D.Heading, { level: 2 }, 'Title'), h(D.Divider), h(D.Grid, { columns: 2 }, h(D.Text, { tone: 'muted' }, 'a'), h(D.Text, null, 'b')))),
});
