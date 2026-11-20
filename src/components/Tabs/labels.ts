// Tabs' own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TabsLabels {
  /** Tabs: the description of a tab that can be closed, since its × is for the pointer only. */
  tabCloseHint: string;
}
export const en: TabsLabels = {
  tabCloseHint: 'Press Delete to close.',
};
export const id: TabsLabels = {
  tabCloseHint: 'Tekan Delete untuk menutup.',
};
