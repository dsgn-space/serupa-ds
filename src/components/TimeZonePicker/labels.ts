// TimeZonePicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TimeZonePickerLabels {
  /** TimeZonePicker: after the offset of the reader's own zone, at the top of the list ("UTC+07:00 · Your time zone"). */
  timeZoneYours: string;
  /** TimeZonePicker: in the empty field, until a zone is chosen (a placeholder you pass wins). */
  timeZonePlaceholder: string;
}
export const en: TimeZonePickerLabels = { timeZoneYours: 'Your time zone', timeZonePlaceholder: 'Search a city or time zone' };
export const id: TimeZonePickerLabels = { timeZoneYours: 'Zona waktu Anda', timeZonePlaceholder: 'Cari kota atau zona waktu' };
