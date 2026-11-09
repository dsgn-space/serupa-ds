// ContextualHelp's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ContextualHelpLabels {
  /** ContextualHelp: its button's name when it has no label, for variant "help" and variant "info". */
  contextualHelp: string;
  contextualInfo: string;
}
export const en: ContextualHelpLabels = {
  contextualHelp: 'Help',
  contextualInfo: 'Information',
};
export const id: ContextualHelpLabels = {
  contextualHelp: 'Bantuan',
  contextualInfo: 'Informasi',
};
