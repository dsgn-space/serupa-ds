// OfflineBanner's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface OfflineBannerLabels {
  /** OfflineBanner: shown and said when the connection drops. */
  offline: string;
  /** OfflineBanner: shown for a moment and said when it comes back. */
  backOnline: string;
}
export const en: OfflineBannerLabels = { offline: "You're offline", backOnline: "Back online" };
export const id: OfflineBannerLabels = { offline: "Anda sedang offline", backOnline: "Kembali online" };
