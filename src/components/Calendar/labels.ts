// Calendar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CalendarLabels {
  /** Calendar month buttons. */
  previousMonth: string;
  nextMonth: string;
  /** Calendar monthYearPicker menus. */
  month: string;
  year: string;
  /** Calendar, DatePicker and DateRangePicker with presets: the name of the list of shortcuts beside the days. */
  presets: string;
  /** Preset shortcuts in Calendar, DatePicker and DateRangePicker. */
  today: string;
  /** Preset shortcuts in Calendar and DatePicker: tomorrow, and the day a week from today. */
  tomorrow: string;
  inAWeek: string;
}
export const en: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  month: "Month",
  year: "Year",
  presets: "Shortcuts",
  today: "Today",
  tomorrow: "Tomorrow",
  inAWeek: "In a week",
};
export const id: CalendarLabels = {
  previousMonth: "Bulan sebelumnya",
  nextMonth: "Bulan berikutnya",
  month: "Bulan",
  year: "Tahun",
  presets: "Pintasan",
  today: "Hari ini",
  tomorrow: "Besok",
  inAWeek: "Seminggu lagi",
};
