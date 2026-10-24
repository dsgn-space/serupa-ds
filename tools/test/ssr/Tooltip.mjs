// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Tooltip: h(D.Tooltip, { content: 'Copy link' }, h(D.Button, null, 'Copy')),
});
