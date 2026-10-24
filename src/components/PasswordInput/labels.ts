// PasswordInput's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface PasswordInputLabels {
  /** PasswordInput show/hide button. */
  showPassword: string;
}
export const en: PasswordInputLabels = {
  showPassword: "Show password",
};
export const id: PasswordInputLabels = {
  showPassword: "Tampilkan kata sandi",
};
