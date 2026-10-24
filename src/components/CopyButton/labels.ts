// CopyButton's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CopyButtonLabels {
  /** CopyButton: its label, what it says once it has copied, and when copying fails. */
  copied: string;
  copyFailed: string;
}
export const en: CopyButtonLabels = {
  copied: "Copied",
  copyFailed: "Couldn't copy. Select the text and copy it yourself.",
};
export const id: CopyButtonLabels = {
  copied: "Disalin",
  copyFailed: "Gagal menyalin. Pilih teksnya lalu salin sendiri.",
};
