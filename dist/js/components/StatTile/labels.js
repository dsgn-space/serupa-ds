// src/components/StatTile/labels.ts
var en = {
  statTileUp: (amount) => "Up " + amount,
  statTileDown: (amount) => "Down " + amount,
  statTileFlat: "No change",
  statTileTrend: (label, count) => label + ", last " + count + " periods"
};
var id = {
  statTileUp: (amount) => "Naik " + amount,
  statTileDown: (amount) => "Turun " + amount,
  statTileFlat: "Tidak berubah",
  statTileTrend: (label, count) => label + ", " + count + " periode terakhir"
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
