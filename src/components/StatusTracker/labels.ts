// StatusTracker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface StatusTrackerLabels {
  /** StatusTracker: each state's word, said for a day and shown in the legend. */
  statusUp: string;
  statusDegraded: string;
  statusDown: string;
  statusNone: string;
  /** StatusTracker: the summary under the strip: percent already in the locale's format ("99.8%"), days and incidents counted. */
  statusSummary: (percent: string, days: number, incidents: number) => string;
  /** StatusTracker: one day, for screen readers and the caption: its date (in the locale's words) and its state. */
  statusDay: (date: string, state: string) => string;
}
export const en: StatusTrackerLabels = {
  statusUp: 'Up',
  statusDegraded: 'Degraded',
  statusDown: 'Down',
  statusNone: 'No data',
  statusSummary: (percent, days, incidents) => percent + ' up over ' + (days === 1 ? '1 day' : days + ' days') + ', ' + (incidents === 0 ? 'no incidents' : incidents === 1 ? '1 incident' : incidents + ' incidents'),
  statusDay: (date, state) => date + ': ' + state,
};
export const id: StatusTrackerLabels = {
  statusUp: 'Aktif',
  statusDegraded: 'Terganggu',
  statusDown: 'Mati',
  statusNone: 'Tidak ada data',
  statusSummary: (percent, days, incidents) => percent + ' aktif selama ' + days + ' hari, ' + (incidents === 0 ? 'tanpa insiden' : incidents + ' insiden'),
  statusDay: (date, state) => date + ': ' + state,
};
