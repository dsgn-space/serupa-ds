// ImageCropper's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ImageCropperLabels {
  /** ImageCropper: the frame's name; arrow keys move the picture in it. */
  cropArea: string;
  /** ImageCropper: the frame's description: how to move and zoom the picture. */
  cropHint: string;
  /** ImageCropper: the zoom slider's name. */
  cropZoom: string;
  /** ImageCropper: the button that zooms out a step. */
  cropZoomOut: string;
  /** ImageCropper: the button that zooms in a step. */
  cropZoomIn: string;
  /** ImageCropper: in the frame when the picture can't be loaded. */
  cropFailed: string;
}
export const en: ImageCropperLabels = {
  cropArea: 'Crop area',
  cropHint: 'Drag the picture or use the arrow keys to move it, and plus or minus to zoom.',
  cropZoom: 'Zoom',
  cropZoomOut: 'Zoom out',
  cropZoomIn: 'Zoom in',
  cropFailed: 'The picture couldn’t be loaded.',
};
export const id: ImageCropperLabels = {
  cropArea: 'Area potong',
  cropHint: 'Seret gambar atau gunakan tombol panah untuk menggesernya, dan plus atau minus untuk memperbesar atau memperkecil.',
  cropZoom: 'Perbesaran',
  cropZoomOut: 'Perkecil',
  cropZoomIn: 'Perbesar',
  cropFailed: 'Gambar tidak dapat dimuat.',
};
