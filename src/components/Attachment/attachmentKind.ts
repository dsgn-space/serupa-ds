// In its own module, without "use client", so a Server Component can call it. Attachment.tsx re-exports it.

/** The kinds of file Attachment draws its own icon and word for. */
export type AttachmentKind = 'pdf' | 'image' | 'sheet' | 'doc' | 'slides' | 'archive' | 'code' | 'audio' | 'video' | 'other';

const BY_EXT: Record<string, AttachmentKind> = {};
const add = (kind: AttachmentKind, exts: string) => { for (const e of exts.split(" ")) BY_EXT[e] = kind; };
add("pdf", "pdf");
add("image", "png jpg jpeg jpe jfif gif webp avif svg bmp ico tif tiff heic heif");
add("sheet", "xls xlsx xlsm ods csv tsv numbers");
add("doc", "doc docx odt rtf txt md pages");
add("slides", "ppt pptx odp key");
add("archive", "zip rar 7z tar gz tgz bz2 xz zst");
add("code", "js mjs cjs ts tsx jsx json html htm css scss xml yml yaml py rb go rs java kt swift c h cpp cs php sh sql");
add("audio", "mp3 wav ogg oga m4a aac flac opus mid midi");
add("video", "mp4 m4v mov webm mkv avi mpg mpeg");

/** The kind of a file, from its MIME type first and its extension after: attachmentKind("Q3.xlsx") is "sheet",
 *  attachmentKind("scan", "application/pdf") is "pdf". A file neither tells apart is "other". */
export function attachmentKind(name: string, type?: string): AttachmentKind {
  const t = (type || "").toLowerCase().split(";")[0].trim();
  if (t === "application/pdf") return "pdf";
  const main = t.split("/")[0];
  if (main === "image" || main === "audio" || main === "video") return main;
  if (/spreadsheet|excel|csv/.test(t)) return "sheet";
  if (/presentation|powerpoint/.test(t)) return "slides";
  if (/zip|compressed|x-tar|gzip|x-7z|x-rar|x-bzip/.test(t)) return "archive";
  if (/wordprocessing|msword|opendocument\.text|rtf|^text\/(plain|markdown)$/.test(t)) return "doc";
  if (/javascript|typescript|json|xml|x-sh|x-python|^text\/(html|css)$/.test(t)) return "code";
  const dot = name.lastIndexOf(".");
  return (dot > 0 && BY_EXT[name.slice(dot + 1).toLowerCase()]) || "other";
}
