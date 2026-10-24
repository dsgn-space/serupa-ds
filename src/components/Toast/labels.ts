// Toast's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ToastLabels {
  /** Toaster region. */
  notifications: string;
  /** Toaster: said once, after the first toast with an action, so keyboard and screen reader users know how to reach it. */
  toastShortcut: (key: string) => string;
  /** Toaster: the line for toasts waiting past the limit. */
  moreToasts: (count: number) => string;
}
export const en: ToastLabels = {
  notifications: "Notifications",
  toastShortcut: (key) => "Press " + key + " to reach it.",
  moreToasts: (n) => "+" + n + " more",
};
export const id: ToastLabels = {
  notifications: "Notifikasi",
  toastShortcut: (key) => "Tekan " + key + " untuk menjangkaunya.",
  moreToasts: (n) => "+" + n + " lainnya",
};
