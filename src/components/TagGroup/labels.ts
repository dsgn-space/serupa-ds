// TagGroup's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface TagGroupLabels {
  /** TagGroup: the name of a tag's × button, with the tag's own words. */
  tagRemove: (name: string) => string;
}
export const en: TagGroupLabels = {
  tagRemove: (name) => 'Remove ' + name,
};
export const id: TagGroupLabels = {
  tagRemove: (name) => 'Hapus ' + name,
};
