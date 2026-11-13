// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  StatusTracker: h(D.StatusTracker, { label: 'API', days: [{ date: '2026-11-04', state: 'up' }, { date: '2026-11-05', state: 'degraded', note: 'Slow' }, { date: '2026-11-06', state: 'down' }] }),
});
