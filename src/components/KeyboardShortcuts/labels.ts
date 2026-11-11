// KeyboardShortcuts's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface KeyboardShortcutsLabels {
  /** KeyboardShortcuts: the help dialog's title. */
  keyboardShortcuts: string;
  /** KeyboardShortcuts: the group for shortcuts given no group. */
  generalShortcuts: string;
  /** KeyboardShortcuts: what "?" does, listed in the dialog. */
  showShortcuts: string;
  /** KeyboardShortcuts: the switch at the foot of the dialog that turns one-key shortcuts on and off. */
  singleKeyShortcuts: string;
  /** KeyboardShortcuts: the switch's second line, saying what it covers and why to turn it off. */
  singleKeyHint: string;
}
export const en: KeyboardShortcutsLabels = {
  keyboardShortcuts: 'Keyboard shortcuts',
  generalShortcuts: 'General',
  showShortcuts: 'Show keyboard shortcuts',
  singleKeyShortcuts: 'Single-key shortcuts',
  singleKeyHint: 'Shortcuts that are one key, such as “?”, outside text fields. Turn them off if they go off by accident.',
};
export const id: KeyboardShortcutsLabels = {
  keyboardShortcuts: 'Pintasan keyboard',
  generalShortcuts: 'Umum',
  showShortcuts: 'Tampilkan pintasan keyboard',
  singleKeyShortcuts: 'Pintasan satu tombol',
  singleKeyHint: 'Pintasan yang hanya satu tombol, seperti “?”, di luar kolom teks. Matikan jika sering terpicu tanpa sengaja.',
};
