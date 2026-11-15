// QRCode's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface QRCodeLabels {
  /** QRCode with status="expired": over the code, and said when it changes. */
  qrExpired: string;
  /** QRCode with status="expired" and onRefresh: the button that makes a new code. */
  qrRefresh: string;
  /** QRCode with status="scanned": over the code, and said when it changes. */
  qrScanned: string;
}
export const en: QRCodeLabels = {
  qrExpired: 'Code expired',
  qrRefresh: 'Get a new code',
  qrScanned: 'Scanned',
};
export const id: QRCodeLabels = {
  qrExpired: 'Kode kedaluwarsa',
  qrRefresh: 'Minta kode baru',
  qrScanned: 'Sudah dipindai',
};
