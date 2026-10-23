// In its own module, without "use client", so a Server Component can call it (a function from a client module is
// only a reference there). FileUpload.tsx re-exports it.

/** A file size for people: 1.5 MB, 820 KB, 12 B. */
export function formatFileSize(bytes: number): string {
  if (!(bytes >= 0)) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return (i === 0 ? String(n) : n >= 10 ? String(Math.round(n)) : String(Math.round(n * 10) / 10)) + " " + units[i];
}
