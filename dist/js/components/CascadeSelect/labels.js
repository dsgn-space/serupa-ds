// src/components/CascadeSelect/labels.ts
var en = {
  cascadePlaceholder: "Choose\u2026",
  cascadePath: (labels) => labels.join(" \u203A "),
  cascadeLevel: (level) => "Level " + level,
  cascadeHasMore: (rtl) => "More options: press " + (rtl ? "Left" : "Right") + " arrow",
  cascadeBack: "Back",
  cascadeLoading: "Loading\u2026",
  cascadeEmpty: "No options",
  cascadeFailed: "Couldn\u2019t load the options. Open that option again to try again."
};
var id = {
  cascadePlaceholder: "Pilih\u2026",
  cascadePath: (labels) => labels.join(" \u203A "),
  cascadeLevel: (level) => "Tingkat " + level,
  cascadeHasMore: (rtl) => "Ada pilihan lain: tekan panah " + (rtl ? "kiri" : "kanan"),
  cascadeBack: "Kembali",
  cascadeLoading: "Memuat\u2026",
  cascadeEmpty: "Tidak ada pilihan",
  cascadeFailed: "Pilihan gagal dimuat. Buka lagi untuk mencoba lagi."
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
