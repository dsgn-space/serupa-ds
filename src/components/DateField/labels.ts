// DateField's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DateFieldLabels {
  /** DateField: the label over the day's box. */
  dateFieldDay: string;
  /** DateField: the label over the month's box. */
  dateFieldMonth: string;
  /** DateField: the label over the year's box. */
  dateFieldYear: string;
  /** DateField: what's wrong, shown under the boxes once focus leaves them or the form is sent. what: a box out of
   *  range ("day", "month"), a year of fewer than 4 digits ("year"), an empty box ("missing-day"…), a date that doesn't
   *  exist ("not-real": detail is the month and year in words, days how many it has), or one outside min or max
   *  ("before-min", "after-max": detail is that date in words). */
  dateFieldError: (what: DateFieldMessage, detail?: string, days?: number) => string;
}
/** Which message DateField shows. */
export type DateFieldMessage = 'day' | 'month' | 'year' | 'missing-day' | 'missing-month' | 'missing-year' | 'not-real' | 'before-min' | 'after-max';
export const en: DateFieldLabels = {
  dateFieldDay: 'Day',
  dateFieldMonth: 'Month',
  dateFieldYear: 'Year',
  dateFieldError: (what, detail, days) => ({
    day: 'Day must be between 1 and 31', month: 'Month must be between 1 and 12', year: 'Year must have 4 numbers',
    'missing-day': 'Enter the day', 'missing-month': 'Enter the month', 'missing-year': 'Enter the year',
    'not-real': `Enter a real date: ${detail ?? ''} has ${days ?? ''} days`,
    'before-min': `Enter a date on or after ${detail ?? ''}`, 'after-max': `Enter a date on or before ${detail ?? ''}`,
  })[what],
};
export const id: DateFieldLabels = {
  dateFieldDay: 'Tanggal',
  dateFieldMonth: 'Bulan',
  dateFieldYear: 'Tahun',
  dateFieldError: (what, detail, days) => ({
    day: 'Tanggal harus antara 1 dan 31', month: 'Bulan harus antara 1 dan 12', year: 'Tahun harus 4 angka',
    'missing-day': 'Isi tanggal', 'missing-month': 'Isi bulan', 'missing-year': 'Isi tahun',
    'not-real': `Masukkan tanggal yang ada: ${detail ?? ''} hanya ${days ?? ''} hari`,
    'before-min': `Masukkan tanggal ${detail ?? ''} atau sesudahnya`, 'after-max': `Masukkan tanggal ${detail ?? ''} atau sebelumnya`,
  })[what],
};
