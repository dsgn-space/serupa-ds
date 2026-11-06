// DateRangePicker's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface DateRangePickerLabels {
  /** DatePicker, DateRangePicker and TimePicker. */
  chooseDates: string;
  startDate: string;
  endDate: string;
  chooseStartDate: string;
  chooseEndDate: string;
  /** DateRangePicker's preset shortcuts: yesterday alone, the last 7 and 30 days up to today, and this and last
      calendar month. */
  yesterday: string;
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastMonth: string;
}
export const en: DateRangePickerLabels = {
  chooseDates: "Choose dates",
  startDate: "Start date",
  endDate: "End date",
  chooseStartDate: "Choose the start date",
  chooseEndDate: "Choose the end date",
  yesterday: "Yesterday",
  last7Days: "Last 7 days",
  last30Days: "Last 30 days",
  thisMonth: "This month",
  lastMonth: "Last month",
};
export const id: DateRangePickerLabels = {
  chooseDates: "Pilih rentang tanggal",
  startDate: "Tanggal mulai",
  endDate: "Tanggal selesai",
  chooseStartDate: "Pilih tanggal mulai",
  chooseEndDate: "Pilih tanggal selesai",
  yesterday: "Kemarin",
  last7Days: "7 hari terakhir",
  last30Days: "30 hari terakhir",
  thisMonth: "Bulan ini",
  lastMonth: "Bulan lalu",
};
