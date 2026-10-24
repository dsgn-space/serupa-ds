// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Link: h(D.Link, { href: 'https://example.com', external: true }, 'Docs'),
});
