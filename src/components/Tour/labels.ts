// Tour's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TourLabels {
  /** Tour: the button to the step before. */
  tourBack: string;
  /** Tour: the button to the next step. */
  tourNext: string;
  /** Tour: the button on the last step, which ends the tour. */
  tourDone: string;
}
export const en: TourLabels = {
  tourBack: "Back",
  tourNext: "Next",
  tourDone: "Done",
};
export const id: TourLabels = {
  tourBack: "Kembali",
  tourNext: "Berikutnya",
  tourDone: "Selesai",
};
