// AvatarGroup's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface AvatarGroupLabels {
  /** AvatarGroup: the name of the "+N" avatar. `formatted` is the count in the locale's digits and grouping; `count`
   *  is there for plural rules. */
  avatarMore: (count: number, formatted: string) => string;
}
export const en: AvatarGroupLabels = {
  avatarMore: (count, formatted = String(count)) => formatted + ' more',
};
export const id: AvatarGroupLabels = {
  avatarMore: (count, formatted = String(count)) => formatted + ' lainnya',
};
