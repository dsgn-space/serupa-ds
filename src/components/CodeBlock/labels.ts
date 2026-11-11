// CodeBlock's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface CodeBlockLabels {
  /** CodeBlock: the copy button's name. */
  codeCopy: string;
  /** CodeBlock: the name of the code's scroll area when it has no title or language. */
  codeName: string;
}
export const en: CodeBlockLabels = { codeCopy: 'Copy code', codeName: 'Code' };
export const id: CodeBlockLabels = { codeCopy: 'Salin kode', codeName: 'Kode' };
