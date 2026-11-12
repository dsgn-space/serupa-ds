// src/components/EventCalendar/labels.ts
var en = {
  goToToday: "Today",
  calendarView: "View",
  monthView: "Month",
  agendaView: "Agenda",
  eventCount: (count) => count === 0 ? "No events" : count === 1 ? "1 event" : count + " events",
  moreEvents: (count) => "+" + count + " more",
  allDay: "All day",
  eventTime: (from, to) => from + " to " + to,
  repeats: "Repeats",
  noEvents: "No events this month."
};
var id = {
  goToToday: "Hari ini",
  calendarView: "Tampilan",
  monthView: "Bulan",
  agendaView: "Agenda",
  eventCount: (count) => count === 0 ? "Tidak ada acara" : count + " acara",
  moreEvents: (count) => "+" + count + " lagi",
  allDay: "Sepanjang hari",
  eventTime: (from, to) => from + " sampai " + to,
  repeats: "Berulang",
  noEvents: "Tidak ada acara bulan ini."
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
