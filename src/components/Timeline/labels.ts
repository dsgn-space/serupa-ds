// Timeline's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TimelineLabels {
  /** A horizontal Timeline's scrolling box, while it scrolls, when it has no aria-label or aria-labelledby. */
  timeline: string;
}
export const en: TimelineLabels = {
  timeline: 'Timeline',
};
export const id: TimelineLabels = {
  timeline: 'Linimasa',
};
