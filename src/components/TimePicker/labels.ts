// TimePicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TimePickerLabels {
  /** DatePicker, DateRangePicker and TimePicker. */
  chooseTime: string;
}
export const en: TimePickerLabels = {
  chooseTime: "Choose a time",
};
export const id: TimePickerLabels = {
  chooseTime: "Pilih waktu",
};
