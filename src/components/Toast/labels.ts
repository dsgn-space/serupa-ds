// Toast's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ToastLabels {
  /** Toaster region. */
  notifications: string;
  /** Toaster: said once, after the first toast with an action, so keyboard and screen reader users know how to reach it. */
  toastShortcut: (key: string) => string;
  /** Toaster: the line for toasts waiting past the limit. */
  moreToasts: (count: number, formatted: string) => string;
  /** A toast shown again while it was still up: the count read with it and said once the burst stops ("12 times"). */
  toastRepeated: (count: number, formatted: string) => string;
  /** toast.undo: the button that takes the action back. */
  undo: string;
}
export const en: ToastLabels = {
  notifications: 'Notifications',
  toastShortcut: (key) => 'Press ' + key + ' to reach it.',
  moreToasts: (n, formatted = String(n)) => '+' + formatted + ' more',
  toastRepeated: (n, formatted = String(n)) => formatted + ' times',
  undo: 'Undo',
};
export const id: ToastLabels = {
  notifications: 'Notifikasi',
  toastShortcut: (key) => 'Tekan ' + key + ' untuk menjangkaunya.',
  moreToasts: (n, formatted = String(n)) => '+' + formatted + ' lainnya',
  toastRepeated: (n, formatted = String(n)) => formatted + ' kali',
  undo: 'Urungkan',
};
