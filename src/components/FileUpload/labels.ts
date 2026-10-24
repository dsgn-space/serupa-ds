// FileUpload's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface FileUploadLabels {
  /** FileUpload. */
  dragFiles: string;
  dragFile: string;
  chooseFiles: string;
  chooseFile: string;
  chosenFiles: string;
  chosenFile: string;
}
export const en: FileUploadLabels = {
  dragFiles: "Drag files here",
  dragFile: "Drag a file here",
  chooseFiles: "Choose files",
  chooseFile: "Choose a file",
  chosenFiles: "Chosen files",
  chosenFile: "Chosen file",
};
export const id: FileUploadLabels = {
  dragFiles: "Seret file ke sini",
  dragFile: "Seret file ke sini",
  chooseFiles: "Pilih file",
  chooseFile: "Pilih file",
  chosenFiles: "File yang dipilih",
  chosenFile: "File yang dipilih",
};
