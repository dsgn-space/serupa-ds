// src/components/Chart/labels.ts
var en = {
  chartKind: (type) => ({ line: "Line chart", bar: "Bar chart", area: "Area chart", donut: "Donut chart" })[type],
  chartSummary: (kind, series, points, first, last) => `${kind}, ${series} series, ${points} ${points === 1 ? "point" : "points"}${points > 1 ? ` from ${first} to ${last}` : ""}.`,
  chartRange: (series, low, lowAt, high, highAt) => `${series}: lowest ${low} in ${lowAt}, highest ${high} in ${highAt}.`,
  chartPoint: (series, category, value) => series ? `${series}, ${category}: ${value}` : `${category}: ${value}`,
  chartNoValue: "No value",
  chartOther: "Other",
  chartShare: (value, percent) => `${value} (${percent})`,
  chartTotal: (total) => `Total: ${total}`,
  chartCategory: "Category",
  chartShowTable: "Show as table",
  chartShowChart: "Show as chart"
};
var id = {
  chartKind: (type) => ({ line: "Diagram garis", bar: "Diagram batang", area: "Diagram area", donut: "Diagram donat" })[type],
  chartSummary: (kind, series, points, first, last) => `${kind}, ${series} seri, ${points} titik${points > 1 ? ` dari ${first} sampai ${last}` : ""}.`,
  chartRange: (series, low, lowAt, high, highAt) => `${series}: terendah ${low} pada ${lowAt}, tertinggi ${high} pada ${highAt}.`,
  chartPoint: (series, category, value) => series ? `${series}, ${category}: ${value}` : `${category}: ${value}`,
  chartNoValue: "Tidak ada nilai",
  chartOther: "Lainnya",
  chartShare: (value, percent) => `${value} (${percent})`,
  chartTotal: (total) => `Jumlah: ${total}`,
  chartCategory: "Kategori",
  chartShowTable: "Tampilkan sebagai tabel",
  chartShowChart: "Tampilkan sebagai diagram"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
