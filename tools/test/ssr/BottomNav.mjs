// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  BottomNav: h(D.BottomNav, { label: 'Main' }, h(D.BottomNavLink, { href: '#home', icon: 'home', active: true }, 'Home'), h(D.BottomNavLink, { href: '#me', icon: 'person' }, 'Account')),
});
