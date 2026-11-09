// CascadeSelect's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CascadeSelectLabels {
  /** CascadeSelect: shown on the button with nothing chosen. */
  cascadePlaceholder: string;
  /** CascadeSelect: the chosen path as text ("Jawa Barat › Bandung › Coblong"). */
  cascadePath: (labels: string[]) => string;
  /** CascadeSelect: a column's name when levels doesn't give one (level counts from 1). */
  cascadeLevel: (level: number) => string;
  /** CascadeSelect: on an option that has options under it, for screen readers, and the hint on how to reach them. */
  cascadeHasMore: (rtl: boolean) => string;
  /** CascadeSelect: the button that goes back a column on a narrow screen, a column while it loads, and an empty one. */
  cascadeBack: string;
  cascadeLoading: string;
  cascadeEmpty: string;
  /** CascadeSelect: a column whose options failed to load (opening its parent again tries again). */
  cascadeFailed: string;
}
export const en: CascadeSelectLabels = {
  cascadePlaceholder: 'Choose…',
  cascadePath: (labels) => labels.join(' › '),
  cascadeLevel: (level) => 'Level ' + level,
  cascadeHasMore: (rtl) => 'More options: press ' + (rtl ? 'Left' : 'Right') + ' arrow',
  cascadeBack: 'Back',
  cascadeLoading: 'Loading…',
  cascadeEmpty: 'No options',
  cascadeFailed: 'Couldn’t load the options',
};
export const id: CascadeSelectLabels = {
  cascadePlaceholder: 'Pilih…',
  cascadePath: (labels) => labels.join(' › '),
  cascadeLevel: (level) => 'Tingkat ' + level,
  cascadeHasMore: (rtl) => 'Ada pilihan lain: tekan panah ' + (rtl ? 'kiri' : 'kanan'),
  cascadeBack: 'Kembali',
  cascadeLoading: 'Memuat…',
  cascadeEmpty: 'Tidak ada pilihan',
  cascadeFailed: 'Pilihan gagal dimuat',
};
