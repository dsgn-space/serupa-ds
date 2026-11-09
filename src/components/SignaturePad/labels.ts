// SignaturePad's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface SignaturePadLabels {
  /** SignaturePad: the name of the switch between drawing and typing. */
  signatureMethod: string;
  /** SignaturePad: the switch's drawing choice. */
  signatureDraw: string;
  /** SignaturePad: the switch's typing choice. */
  signatureType: string;
  /** SignaturePad: under the switch while drawing; it points keyboard users to Type. */
  signatureDrawHint: string;
  /** SignaturePad: under the switch while typing. */
  signatureTypeHint: string;
  /** SignaturePad: the drawing box's name while it's empty. */
  signatureEmpty: string;
  /** SignaturePad: the drawing box's name once something is drawn. */
  signatureDrawn: string;
  /** SignaturePad: the button that takes the last stroke away. */
  signatureUndo: string;
  /** SignaturePad: the button that takes every stroke away. */
  signatureClear: string;
  /** SignaturePad: the typing field's label. */
  signatureName: string;
}
export const en: SignaturePadLabels = {
  signatureMethod: 'Signature method',
  signatureDraw: 'Draw',
  signatureType: 'Type',
  signatureDrawHint: 'Draw your signature with a mouse, pen or finger, or choose Type to type your name.',
  signatureTypeHint: 'Your typed full name is your signature.',
  signatureEmpty: 'Signature area, empty',
  signatureDrawn: 'Signature drawn',
  signatureUndo: 'Undo',
  signatureClear: 'Clear',
  signatureName: 'Full name',
};
export const id: SignaturePadLabels = {
  signatureMethod: 'Cara tanda tangan',
  signatureDraw: 'Gambar',
  signatureType: 'Ketik',
  signatureDrawHint: 'Gambar tanda tangan Anda dengan mouse, pena, atau jari, atau pilih Ketik untuk mengetik nama Anda.',
  signatureTypeHint: 'Nama lengkap yang Anda ketik menjadi tanda tangan Anda.',
  signatureEmpty: 'Area tanda tangan, kosong',
  signatureDrawn: 'Tanda tangan digambar',
  signatureUndo: 'Urungkan',
  signatureClear: 'Hapus',
  signatureName: 'Nama lengkap',
};
