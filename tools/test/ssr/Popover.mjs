// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Popover: h(D.Popover, { trigger: h(D.Button, null, 'Share'), title: 'Share' }, 'Body'),
});
