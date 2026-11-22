// StatTile's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface StatTileLabels {
  /** StatTile: the change badge for a rise, from the amount already formatted ("Up 12%"). */
  statTileUp: (amount: string) => string;
  /** StatTile: the change badge for a fall ("Down 4%"). */
  statTileDown: (amount: string) => string;
  /** StatTile: the change badge when nothing changed. */
  statTileFlat: string;
  /** StatTile: the trend line's name, from the label and how many values it has ("Revenue, last 8 periods"). */
  statTileTrend: (label: string, count: number) => string;
}
export const en: StatTileLabels = {
  statTileUp: (amount) => 'Up ' + amount,
  statTileDown: (amount) => 'Down ' + amount,
  statTileFlat: 'No change',
  statTileTrend: (label, count) => label + ', last ' + count + ' periods',
};
export const id: StatTileLabels = {
  statTileUp: (amount) => 'Naik ' + amount,
  statTileDown: (amount) => 'Turun ' + amount,
  statTileFlat: 'Tidak berubah',
  statTileTrend: (label, count) => label + ', ' + count + ' periode terakhir',
};
