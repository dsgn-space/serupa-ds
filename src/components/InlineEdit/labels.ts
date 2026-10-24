// InlineEdit's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface InlineEditLabels {
  /** InlineEdit: after the text in its button's name ("Project name: Apollo, Edit"). */
  edit: string;
}
export const en: InlineEditLabels = { edit: "Edit" };
export const id: InlineEditLabels = { edit: "Ubah" };
