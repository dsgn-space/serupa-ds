// MaskedValue's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface MaskedValueLabels {
  /** MaskedValue: what screen readers hear while it's masked with an end kept ("Card number ending in 1208"). */
  maskedEnding: (label: string, end: string) => string;
  /** MaskedValue: what screen readers hear while it's masked with nothing kept ("Balance, hidden"). */
  maskedHidden: (label: string) => string;
  /** MaskedValue with revealable: the Show button's name ("Show card number"); it's pressed while the value shows. */
  showValue: (label: string) => string;
}
export const en: MaskedValueLabels = {
  maskedEnding: (label, end) => label + ' ending in ' + end,
  maskedHidden: (label) => label + ', hidden',
  showValue: (label) => 'Show ' + label,
};
export const id: MaskedValueLabels = {
  maskedEnding: (label, end) => label + ' berakhiran ' + end,
  maskedHidden: (label) => label + ', disembunyikan',
  showValue: (label) => 'Tampilkan ' + label,
};
