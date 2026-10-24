// Calendar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CalendarLabels {
  /** Calendar month buttons. */
  previousMonth: string;
  nextMonth: string;
}
export const en: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
};
export const id: CalendarLabels = {
  previousMonth: "Bulan sebelumnya",
  nextMonth: "Bulan berikutnya",
};
