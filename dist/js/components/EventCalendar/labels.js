// src/components/EventCalendar/labels.ts
var en = {
  goToToday: "Today",
  calendarView: "View",
  monthView: "Month",
  agendaView: "Agenda",
  eventCount: (count, formatted = String(count)) => count === 0 ? "No events" : formatted + (count === 1 ? " event" : " events"),
  moreEvents: (count, formatted = String(count)) => "+" + formatted + " more",
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
  eventCount: (count, formatted = String(count)) => count === 0 ? "Tidak ada acara" : formatted + " acara",
  moreEvents: (count, formatted = String(count)) => "+" + formatted + " lagi",
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
