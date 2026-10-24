// NumberInput's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface NumberInputLabels {
  /** NumberInput step buttons. */
  decrease: string;
  increase: string;
}
export const en: NumberInputLabels = {
  decrease: "Decrease",
  increase: "Increase",
};
export const id: NumberInputLabels = {
  decrease: "Kurangi",
  increase: "Tambah",
};
