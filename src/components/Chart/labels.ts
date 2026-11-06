// Chart's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface ChartLabels {
  /** Chart: what kind of chart it is, read before its summary ("Line chart"). */
  chartKind: (type: 'line' | 'bar') => string;
  /** Chart: the summary a screen reader hears first: the kind, how many series and points, and the first and last
      category ("Line chart, 2 series, 12 points from Jan to Dec."). */
  chartSummary: (kind: string, series: number, points: number, first: string, last: string) => string;
  /** Chart: one series' lowest and highest value, after the summary ("Visitors: lowest 80 in Feb, highest 300 in Nov."). */
  chartRange: (series: string, low: string, lowAt: string, high: string, highAt: string) => string;
  /** Chart: a point's name, read when it has focus ("Visitors, Jan: 120"). series is null when there's one series. */
  chartPoint: (series: string | null, category: string, value: string) => string;
  /** Chart: a missing value, in the table. */
  chartNoValue: string;
  /** Chart: the first column's heading in the table, when categoryLabel isn't given. */
  chartCategory: string;
  /** Chart: the button that shows the same numbers as a table. */
  chartShowTable: string;
  /** Chart: the button that goes back to the chart from the table. */
  chartShowChart: string;
}
export const en: ChartLabels = {
  chartKind: (type) => (type === 'bar' ? 'Bar chart' : 'Line chart'),
  chartSummary: (kind, series, points, first, last) => `${kind}, ${series} series, ${points} ${points === 1 ? 'point' : 'points'}${points > 1 ? ` from ${first} to ${last}` : ''}.`,
  chartRange: (series, low, lowAt, high, highAt) => `${series}: lowest ${low} in ${lowAt}, highest ${high} in ${highAt}.`,
  chartPoint: (series, category, value) => (series ? `${series}, ${category}: ${value}` : `${category}: ${value}`),
  chartNoValue: 'No value',
  chartCategory: 'Category',
  chartShowTable: 'Show as table',
  chartShowChart: 'Show as chart',
};
export const id: ChartLabels = {
  chartKind: (type) => (type === 'bar' ? 'Diagram batang' : 'Diagram garis'),
  chartSummary: (kind, series, points, first, last) => `${kind}, ${series} seri, ${points} titik${points > 1 ? ` dari ${first} sampai ${last}` : ''}.`,
  chartRange: (series, low, lowAt, high, highAt) => `${series}: terendah ${low} pada ${lowAt}, tertinggi ${high} pada ${highAt}.`,
  chartPoint: (series, category, value) => (series ? `${series}, ${category}: ${value}` : `${category}: ${value}`),
  chartNoValue: 'Tidak ada nilai',
  chartCategory: 'Kategori',
  chartShowTable: 'Tampilkan sebagai tabel',
  chartShowChart: 'Tampilkan sebagai diagram',
};
