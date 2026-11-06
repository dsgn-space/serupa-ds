// In its own module, without "use client", so a Server Component can call it (a function from a client module is
// only a reference there). FileUpload.tsx re-exports it.
import { formatNumber } from "../FormattedNumber/formatNumber";

/** A file size for people: 1.5 MB, 820 kB, 12 B, in steps of 1000 (1 MB is 1,000,000 bytes, as macOS, iOS and
 *  Android count, so a maxSize of 5_000_000 is "5 MB"), with the short names Intl gives every locale. With a locale, in that locale's digits and units, the same as
 *  FormattedNumber format="bytes": formatFileSize(1_500_000, "id-ID") is "1,5 MB" (GR20). */
export function formatFileSize(bytes: number, locale?: string): string {
  if (!(bytes >= 0)) return "";
  // Only a string: sizes.map(formatFileSize) passes each index here.
  if (typeof locale === "string" && locale) return formatNumber(bytes, locale, { format: "bytes" });
  const units = ["B", "kB", "MB", "GB", "TB"];
  let i = 0, n = bytes;
  const rounded = () => (i === 0 ? n : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);
  // A size that rounds up to 1000 steps up too, as formatNumber's does: 999,999 is "1 MB", not "1000 kB".
  while ((n >= 1000 || rounded() >= 1000) && i < units.length - 1) { n /= 1000; i++; }
  return String(rounded()) + " " + units[i];
}
