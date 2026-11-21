// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  AppShell: h(D.AppShell, { header: h('header', null, 'Acme'), sidebar: h('nav', { 'aria-label': 'Workspace' }, 'Links'), footer: '© Acme', background: 'muted' }, h('h1', null, 'Dashboard')),
});
