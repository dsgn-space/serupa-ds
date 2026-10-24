// DateRangePicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DateRangePickerLabels {
  /** DatePicker, DateRangePicker and TimePicker. */
  chooseDates: string;
  startDate: string;
  endDate: string;
  chooseStartDate: string;
  chooseEndDate: string;
}
export const en: DateRangePickerLabels = {
  chooseDates: "Choose dates",
  startDate: "Start date",
  endDate: "End date",
  chooseStartDate: "Choose the start date",
  chooseEndDate: "Choose the end date",
};
export const id: DateRangePickerLabels = {
  chooseDates: "Pilih rentang tanggal",
  startDate: "Tanggal mulai",
  endDate: "Tanggal selesai",
  chooseStartDate: "Pilih tanggal mulai",
  chooseEndDate: "Pilih tanggal selesai",
};
