// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Field: h(D.Field, { label: 'Name', hint: 'As on your ID', error: 'Required', required: true }, h(D.Input, {})),
});
