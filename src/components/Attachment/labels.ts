// Attachment's own words, in English and Indonesian. tools/build/registry.mjs adds them to SerupaLabels,
// enLabels and idLabels, so <SerupaProvider labels> changes them like any other label.
export interface AttachmentLabels {
  /** Attachment: the kind of file, shown before its size ("PDF · 1.5 MB") and read with the name. */
  attachmentPdf: string;
  attachmentImage: string;
  attachmentSheet: string;
  attachmentDoc: string;
  attachmentSlides: string;
  attachmentArchive: string;
  attachmentCode: string;
  attachmentAudio: string;
  attachmentVideo: string;
  attachmentOther: string;
}
export const en: AttachmentLabels = {
  attachmentPdf: "PDF",
  attachmentImage: "Image",
  attachmentSheet: "Spreadsheet",
  attachmentDoc: "Document",
  attachmentSlides: "Slides",
  attachmentArchive: "Archive",
  attachmentCode: "Code",
  attachmentAudio: "Audio",
  attachmentVideo: "Video",
  attachmentOther: "File",
};
export const id: AttachmentLabels = {
  attachmentPdf: "PDF",
  attachmentImage: "Gambar",
  attachmentSheet: "Lembar kerja",
  attachmentDoc: "Dokumen",
  attachmentSlides: "Presentasi",
  attachmentArchive: "Arsip",
  attachmentCode: "Kode",
  attachmentAudio: "Audio",
  attachmentVideo: "Video",
  attachmentOther: "Berkas",
};
