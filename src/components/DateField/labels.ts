// DateField's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DateFieldLabels {
  /** DateField: the label over the day's box. */
  dateFieldDay: string;
  /** DateField: the label over the month's box. */
  dateFieldMonth: string;
  /** DateField: the label over the year's box. */
  dateFieldYear: string;
}
export const en: DateFieldLabels = {
  dateFieldDay: 'Day',
  dateFieldMonth: 'Month',
  dateFieldYear: 'Year',
};
export const id: DateFieldLabels = {
  dateFieldDay: 'Tanggal',
  dateFieldMonth: 'Bulan',
  dateFieldYear: 'Tahun',
};
