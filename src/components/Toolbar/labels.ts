// Toolbar's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ToolbarLabels {
  /** Toolbar with overflow: the button at the end that opens the controls with no room. */
  toolbarMore: string;
}
export const en: ToolbarLabels = {
  toolbarMore: 'More',
};
export const id: ToolbarLabels = {
  toolbarMore: 'Lainnya',
};
