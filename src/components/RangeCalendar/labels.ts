// RangeCalendar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface RangeCalendarLabels {
  /** RangeCalendar: added to the name of a day between the start and the end ("Wednesday, November 4, 2026, in the range"). */
  inRange: string;
  /** RangeCalendar: said once both ends are picked, with the range as the locale writes it ("Nov 3 – 8, 2026"). */
  rangeSelected: (range: string) => string;
}
export const en: RangeCalendarLabels = {
  inRange: 'in the range',
  rangeSelected: (range) => 'Selected range: ' + range,
};
export const id: RangeCalendarLabels = {
  inRange: 'dalam rentang',
  rangeSelected: (range) => 'Rentang terpilih: ' + range,
};
