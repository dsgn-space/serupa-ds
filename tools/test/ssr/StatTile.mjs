// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  StatTile: h(D.StatTile, { label: 'Revenue', value: '€48,200', change: { amount: '12%', direction: 'up' }, period: 'vs last month', trend: [1, 3, 2, 4] }),
});
