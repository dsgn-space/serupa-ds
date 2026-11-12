// Lightbox's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface LightboxLabels {
  /** Lightbox arrows. */
  previousImage: string;
  nextImage: string;
  /** Lightbox: where the shown picture is in the set ("2 of 5"). */
  imageOf: (image: number, total: number) => string;
}
export const en: LightboxLabels = {
  previousImage: 'Previous image',
  nextImage: 'Next image',
  imageOf: (image, total) => image + ' of ' + total,
};
export const id: LightboxLabels = {
  previousImage: 'Gambar sebelumnya',
  nextImage: 'Gambar berikutnya',
  imageOf: (image, total) => image + ' dari ' + total,
};
