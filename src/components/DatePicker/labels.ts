// DatePicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DatePickerLabels {
  /** DatePicker, DateRangePicker and TimePicker. */
  chooseDate: string;
}
export const en: DatePickerLabels = {
  chooseDate: "Choose a date",
};
export const id: DatePickerLabels = {
  chooseDate: "Pilih tanggal",
};
