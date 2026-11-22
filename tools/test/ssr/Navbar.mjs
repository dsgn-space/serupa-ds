// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
    Navbar: h(D.Navbar, { brand: 'Serupa' }, h(D.NavbarLink, { href: '/', current: true }, 'Home')),
    NavbarMenu: h(D.Navbar, { brand: 'Serupa' },
      h(D.NavbarMenu, { label: 'Products', current: true },
        h(D.NavbarMenuGroup, { title: 'Payments' }, h(D.NavbarMenuLink, { href: '/billing', description: 'Invoices, plans and receipts', current: true }, 'Billing')))),
});
