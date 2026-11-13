// EventCalendar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface EventCalendarLabels {
  /** EventCalendar: the button that shows the month with today in it. */
  goToToday: string;
  /** EventCalendar: the view switch's name and its options. */
  calendarView: string;
  monthView: string;
  weekView: string;
  dayView: string;
  agendaView: string;
  /** EventCalendar: Previous and Next in the week and day views (the month view says "Previous month"). */
  previousWeek: string;
  nextWeek: string;
  previousDay: string;
  nextDay: string;
  /** EventCalendar: how many events a day holds, read with the day ("Tuesday, March 4, 2025, 3 events"). */
  eventCount: (count: number, formatted: string) => string;
  /** EventCalendar: the button for the events a day has no room for ("+2 more"). */
  moreEvents: (count: number, formatted: string) => string;
  /** EventCalendar: an event that takes the whole day, in place of its time. */
  allDay: string;
  /** EventCalendar: an event's time, from start to end ("10:00 AM to 10:30 AM"). */
  eventTime: (from: string, to: string) => string;
  /** EventCalendar: said after a repeating event's time. */
  repeats: string;
  /** EventCalendar's agenda view when the month has no events. */
  noEvents: string;
}
export const en: EventCalendarLabels = {
  goToToday: 'Today',
  calendarView: 'View',
  monthView: 'Month',
  weekView: 'Week',
  dayView: 'Day',
  agendaView: 'Agenda',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  previousDay: 'Previous day',
  nextDay: 'Next day',
  eventCount: (count, formatted = String(count)) => (count === 0 ? 'No events' : formatted + (count === 1 ? ' event' : ' events')),
  moreEvents: (count, formatted = String(count)) => '+' + formatted + ' more',
  allDay: 'All day',
  eventTime: (from, to) => from + ' to ' + to,
  repeats: 'Repeats',
  noEvents: 'No events this month',
};
export const id: EventCalendarLabels = {
  goToToday: 'Hari ini',
  calendarView: 'Tampilan',
  monthView: 'Bulan',
  weekView: 'Minggu',
  dayView: 'Hari',
  agendaView: 'Agenda',
  previousWeek: 'Minggu sebelumnya',
  nextWeek: 'Minggu berikutnya',
  previousDay: 'Hari sebelumnya',
  nextDay: 'Hari berikutnya',
  eventCount: (count, formatted = String(count)) => (count === 0 ? 'Tidak ada acara' : formatted + ' acara'),
  moreEvents: (count, formatted = String(count)) => '+' + formatted + ' lagi',
  allDay: 'Sepanjang hari',
  eventTime: (from, to) => from + ' sampai ' + to,
  repeats: 'Berulang',
  noEvents: 'Tidak ada acara bulan ini',
};
