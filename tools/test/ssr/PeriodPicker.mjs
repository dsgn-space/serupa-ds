// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  PeriodPicker: h(D.PeriodPicker, { 'aria-label': 'Report month', defaultValue: '2025-03', name: 'month', locale: 'en-US' }),
  'PeriodPicker quarter': h(D.PeriodPicker, { 'aria-label': 'Quarter', unit: 'quarter', defaultValue: '2025-Q1', locale: 'en-US' }),
});
