// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Sparkline: h(D.Sparkline, { data: [12, 9, 21, 18], label: 'Revenue' }),
  'Sparkline area': h(D.Sparkline, { data: [1, 3, 2], label: 'Visits', area: true }),
});
