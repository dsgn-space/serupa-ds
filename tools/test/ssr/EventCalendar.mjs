// Server-rendered by tools/test/package.mjs: each case renders with renderToString from the built package.
export default ({ h, D }) => ({
  EventCalendar: h(D.EventCalendar, { events: [{ id: 'a', title: 'Launch', start: '2025-03-12', allDay: true }], defaultMonth: new Date(2025, 2, 1), locale: 'en-US' }),
});
