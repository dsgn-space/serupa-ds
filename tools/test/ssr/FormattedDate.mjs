// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  FormattedDate: h(D.FormattedDate, { value: '2026-11-20', locale: 'en' }),
  FormattedDateRange: h(D.FormattedDate, { value: '2026-11-20', to: '2026-11-22', locale: 'en' }),
  FormattedDateMoment: h(D.FormattedDate, { value: '2026-11-20T02:30:00Z', timeStyle: 'short', locale: 'en' }),
});
