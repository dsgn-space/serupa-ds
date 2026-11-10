// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Chart: h(D.Chart, { title: 'Visitors', categories: ['Jan', 'Feb', 'Mar'], series: [{ name: 'Visitors', values: [1, null, 3] }, { name: 'Sign-ups', values: [2, 2, 1] }] }),
  'Chart bar table': h(D.Chart, { type: 'bar', title: 'Orders', categories: ['North', 'South'], series: [{ name: 'Orders', values: [4, 5] }], defaultView: 'table' }),
  'Chart busy': h(D.Chart, { title: 'Visitors', categories: [], series: [], busy: true }),
});
