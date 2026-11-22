// Form's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface FormLabels {
  /** Form: the page's title while a failed submit's errors show, so the tab and a screen reader's first words say so. */
  formErrorTitle: (title: string) => string;
  /** Form: under a field while its answer is checked, often on the server (a check from the checks prop). */
  formChecking: string;
  /** FormSteps: the button to the next step. */
  formNext: string;
  /** FormSteps: the button back to the step before. */
  formBack: string;
}
export const en: FormLabels = {
  formErrorTitle: (title) => 'Error: ' + title,
  formChecking: 'Checking…',
  formNext: 'Next',
  formBack: 'Back',
};
export const id: FormLabels = {
  formErrorTitle: (title) => 'Kesalahan: ' + title,
  formChecking: 'Memeriksa…',
  formNext: 'Berikutnya',
  formBack: 'Kembali',
};
