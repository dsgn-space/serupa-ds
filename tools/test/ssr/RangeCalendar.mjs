// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  RangeCalendar: h(D.RangeCalendar, { locale: 'en-US', defaultValue: { start: '2026-11-03', end: '2026-11-08' } }),
  RangeCalendarTwo: h(D.RangeCalendar, { locale: 'en-US', months: 2, defaultMonth: new Date(2026, 10, 1) }),
});
