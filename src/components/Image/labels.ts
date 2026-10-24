// Image's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ImageLabels {
  /** Image view and remove buttons, and the viewer's name when the image has no alt text. */
  viewImage: string;
  removeImage: string;
}
export const en: ImageLabels = {
  viewImage: "View image",
  removeImage: "Remove image",
};
export const id: ImageLabels = {
  viewImage: "Lihat gambar",
  removeImage: "Hapus gambar",
};
