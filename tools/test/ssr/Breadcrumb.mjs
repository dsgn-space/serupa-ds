// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Breadcrumb: h(D.Breadcrumb, null, h(D.BreadcrumbItem, { href: '/' }, 'Home'), h(D.BreadcrumbItem, null, 'Settings')),
});
