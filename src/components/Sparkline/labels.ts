// Sparkline's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface SparklineLabels {
  /** Sparkline: its accessible name, from what it measures and its numbers, already formatted ("Revenue: from 12 to 18, low 9, high 21"). */
  sparklineSummary: (label: string, first: string, last: string, min: string, max: string) => string;
}
export const en: SparklineLabels = {
  sparklineSummary: (label, first, last, min, max) => label + ': from ' + first + ' to ' + last + ', low ' + min + ', high ' + max,
};
export const id: SparklineLabels = {
  sparklineSummary: (label, first, last, min, max) => label + ': dari ' + first + ' ke ' + last + ', terendah ' + min + ', tertinggi ' + max,
};
