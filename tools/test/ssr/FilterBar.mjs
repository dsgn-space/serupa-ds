// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  FilterBar: h(D.FilterBar, { fields: [{ id: 'status', label: 'Status', type: 'select', multiple: true, options: ['Open', 'Closed'] }, { id: 'due', label: 'Due', type: 'date-range' }], defaultValue: { status: ['Open'], due: { start: '2026-11-02', end: '2026-11-08' } }, resultsCount: 24 }),
});
