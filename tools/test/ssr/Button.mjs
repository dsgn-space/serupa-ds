// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Button: h(D.Button, { leftIcon: 'add', loading: true }, 'Save'),
    'Button (link)': h(D.Button, { href: '/docs', variant: 'link' }, 'Docs'),
});
