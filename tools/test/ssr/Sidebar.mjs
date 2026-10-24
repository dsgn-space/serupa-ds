// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Sidebar: h(D.Sidebar, null, h(D.SidebarSection, { title: 'Workspace' }, h(D.SidebarItem, { href: '/', icon: 'home', label: 'Home', active: true }))),
});
