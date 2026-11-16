// src/components/Attachment/attachmentKind.ts
var EXTS = [
  ["pdf", " pdf "],
  ["image", " png jpg jpeg jpe jfif gif webp avif svg bmp ico tif tiff heic heif "],
  ["sheet", " xls xlsx xlsm ods csv tsv numbers "],
  ["doc", " doc docx odt rtf txt md pages "],
  ["slides", " ppt pptx odp key "],
  ["archive", " zip rar 7z tar gz tgz bz2 xz zst "],
  ["code", " js mjs cjs ts tsx jsx json html htm css scss xml yml yaml py rb go rs java kt swift c h cpp cs php sh sql "],
  ["audio", " mp3 wav ogg oga m4a aac flac opus mid midi "],
  ["video", " mp4 m4v mov webm mkv avi mpg mpeg "]
];
function attachmentKind(name, type) {
  const t = ((type || "").toLowerCase().split(";")[0] ?? "").trim();
  if (t === "application/pdf") return "pdf";
  const main = t.split("/")[0];
  if (main === "image" || main === "audio" || main === "video") return main;
  if (/spreadsheet|excel|csv/.test(t)) return "sheet";
  if (/presentation|powerpoint/.test(t)) return "slides";
  if (/zip|compressed|x-tar|gzip|x-7z|x-rar|x-bzip/.test(t)) return "archive";
  if (/wordprocessing|msword|opendocument\.text|rtf|^text\/(plain|markdown)$/.test(t)) return "doc";
  if (/javascript|typescript|json|xml|x-sh|x-python|^text\/(html|css)$/.test(t)) return "code";
  const dot = name.lastIndexOf("."), ext = dot > 0 ? " " + name.slice(dot + 1).toLowerCase() + " " : "";
  const hit = ext.trim() ? EXTS.find(([, list]) => list.includes(ext)) : void 0;
  return hit ? hit[0] : "other";
}
export {
  attachmentKind
};
//# sourceMappingURL=attachmentKind.js.map
