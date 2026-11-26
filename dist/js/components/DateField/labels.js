// src/components/DateField/labels.ts
var en = {
  dateFieldDay: "Day",
  dateFieldMonth: "Month",
  dateFieldYear: "Year",
  dateFieldError: (what, detail, days) => ({
    day: "Day must be between 1 and 31",
    month: "Month must be between 1 and 12",
    year: "Year must have 4 numbers",
    "missing-day": "Enter the day",
    "missing-month": "Enter the month",
    "missing-year": "Enter the year",
    "not-real": `Enter a real date: ${detail ?? ""} has ${days ?? ""} days`,
    "before-min": `Enter a date on or after ${detail ?? ""}`,
    "after-max": `Enter a date on or before ${detail ?? ""}`
  })[what]
};
var id = {
  dateFieldDay: "Tanggal",
  dateFieldMonth: "Bulan",
  dateFieldYear: "Tahun",
  dateFieldError: (what, detail, days) => ({
    day: "Tanggal harus antara 1 dan 31",
    month: "Bulan harus antara 1 dan 12",
    year: "Tahun harus 4 angka",
    "missing-day": "Isi tanggal",
    "missing-month": "Isi bulan",
    "missing-year": "Isi tahun",
    "not-real": `Masukkan tanggal yang ada: ${detail ?? ""} hanya ${days ?? ""} hari`,
    "before-min": `Masukkan tanggal ${detail ?? ""} atau sesudahnya`,
    "after-max": `Masukkan tanggal ${detail ?? ""} atau sebelumnya`
  })[what]
};
export {
  en,
  id
};
//# sourceMappingURL=labels.js.map
