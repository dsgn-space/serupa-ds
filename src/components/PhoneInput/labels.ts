// PhoneInput's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface PhoneInputLabels {
  /** PhoneInput's country menu. */
  country: string;
}
export const en: PhoneInputLabels = { country: "Country" };
export const id: PhoneInputLabels = { country: "Negara" };
