// In its own module, without "use client", so a Server Component can call it. Attachment.tsx re-exports it.

/** The kinds of file Attachment draws its own icon and word for. */
export type AttachmentKind = 'pdf' | 'image' | 'sheet' | 'doc' | 'slides' | 'archive' | 'code' | 'audio' | 'video' | 'other';

// Each kind's extensions, space-separated with a space at each end, so " pdf " finds a whole one. Constant strings
// keep the module free of state and of work on import.
const EXTS: ReadonlyArray<readonly [AttachmentKind, string]> = [
  ['pdf', ' pdf '],
  ['image', ' png jpg jpeg jpe jfif gif webp avif svg bmp ico tif tiff heic heif '],
  ['sheet', ' xls xlsx xlsm ods csv tsv numbers '],
  ['doc', ' doc docx odt rtf txt md pages '],
  ['slides', ' ppt pptx odp key '],
  ['archive', ' zip rar 7z tar gz tgz bz2 xz zst '],
  ['code', ' js mjs cjs ts tsx jsx json html htm css scss xml yml yaml py rb go rs java kt swift c h cpp cs php sh sql '],
  ['audio', ' mp3 wav ogg oga m4a aac flac opus mid midi '],
  ['video', ' mp4 m4v mov webm mkv avi mpg mpeg '],
];

/** The kind of a file, from its MIME type first and its extension after: attachmentKind("Q3.xlsx") is "sheet",
 *  attachmentKind("scan", "application/pdf") is "pdf". A file neither tells apart is "other". */
export function attachmentKind(name: string, type?: string): AttachmentKind {
  const t = (type || '').toLowerCase().split(';')[0].trim();
  if (t === 'application/pdf') return 'pdf';
  const main = t.split('/')[0];
  if (main === 'image' || main === 'audio' || main === 'video') return main;
  if (/spreadsheet|excel|csv/.test(t)) return 'sheet';
  if (/presentation|powerpoint/.test(t)) return 'slides';
  if (/zip|compressed|x-tar|gzip|x-7z|x-rar|x-bzip/.test(t)) return 'archive';
  if (/wordprocessing|msword|opendocument\.text|rtf|^text\/(plain|markdown)$/.test(t)) return 'doc';
  if (/javascript|typescript|json|xml|x-sh|x-python|^text\/(html|css)$/.test(t)) return 'code';
  const dot = name.lastIndexOf('.'), ext = dot > 0 ? ' ' + name.slice(dot + 1).toLowerCase() + ' ' : '';
  const hit = ext.trim() ? EXTS.find(([, list]) => list.includes(ext)) : undefined;
  return hit ? hit[0] : 'other';
}
