// ColorPicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ColorPickerLabels {
  /** ColorPicker: the native picker's name, the hex field's name, and the contrast line under them. */
  customColor: string;
  hexCode: string;
  contrast: (ratio: string) => string;
  lowContrast: (minimum: string) => string;
}
export const en: ColorPickerLabels = {
  customColor: "Custom color",
  hexCode: "Hex code",
  contrast: (ratio) => "Contrast " + ratio + ":1",
  lowContrast: (min) => "below " + min + ":1, which can be hard to read",
};
export const id: ColorPickerLabels = {
  customColor: "Warna khusus",
  hexCode: "Kode hex",
  contrast: (ratio) => "Kontras " + ratio + ":1",
  lowContrast: (min) => "di bawah " + min + ":1, bisa sulit dibaca",
};
