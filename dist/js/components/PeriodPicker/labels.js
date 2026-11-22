// src/components/PeriodPicker/labels.ts
var en = {
  periodPlaceholder: (unit) => "Choose a " + unit,
  periodPrevious: (unit) => unit === "year" ? "Previous 12 years" : "Previous year",
  periodNext: (unit) => unit === "year" ? "Next 12 years" : "Next year",
  periodQuarter: (q, year) => "Q" + q + (year ? " " + year : "")
};
var id = {
  periodPlaceholder: (unit) => "Pilih " + (unit === "month" ? "bulan" : unit === "quarter" ? "kuartal" : "tahun"),
  periodPrevious: (unit) => unit === "year" ? "12 tahun sebelumnya" : "Tahun sebelumnya",
  periodNext: (unit) => unit === "year" ? "12 tahun berikutnya" : "Tahun berikutnya",
  periodQuarter: (q, year) => "K" + q + (year ? " " + year : "")
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
