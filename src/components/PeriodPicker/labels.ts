// PeriodPicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface PeriodPickerLabels {
  /** PeriodPicker: shown on the button with nothing chosen, and the popup's name: "Choose a month". */
  periodPlaceholder: (unit: 'month' | 'quarter' | 'year') => string;
  /** PeriodPicker: the buttons to the page before and after: a year earlier for months and quarters, twelve years for years. */
  periodPrevious: (unit: 'month' | 'quarter' | 'year') => string;
  periodNext: (unit: 'month' | 'quarter' | 'year') => string;
  /** PeriodPicker: a quarter (1 to 4), alone in the grid ("Q4"), or with its year, already written in the locale ("Q4 2026"). */
  periodQuarter: (quarter: number, year?: string) => string;
}
export const en: PeriodPickerLabels = {
  periodPlaceholder: (unit) => 'Choose a ' + unit,
  periodPrevious: (unit) => (unit === 'year' ? 'Previous 12 years' : 'Previous year'),
  periodNext: (unit) => (unit === 'year' ? 'Next 12 years' : 'Next year'),
  periodQuarter: (q, year) => 'Q' + q + (year ? ' ' + year : ''),
};
export const id: PeriodPickerLabels = {
  periodPlaceholder: (unit) => 'Pilih ' + (unit === 'month' ? 'bulan' : unit === 'quarter' ? 'kuartal' : 'tahun'),
  periodPrevious: (unit) => (unit === 'year' ? '12 tahun sebelumnya' : 'Tahun sebelumnya'),
  periodNext: (unit) => (unit === 'year' ? '12 tahun berikutnya' : 'Tahun berikutnya'),
  periodQuarter: (q, year) => 'K' + q + (year ? ' ' + year : ''),
};
