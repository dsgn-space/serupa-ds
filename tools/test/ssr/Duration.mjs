// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  Duration: h(D.Duration, { value: 75, unit: 'minute', locale: 'en' }),
  DurationDigital: h(D.Duration, { value: 5400, display: 'digital', locale: 'en' }),
});
