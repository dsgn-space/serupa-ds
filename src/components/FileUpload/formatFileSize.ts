// In its own module, without "use client", so a Server Component can call it (a function from a client module is
// only a reference there). FileUpload.tsx re-exports it.
import { formatNumber } from '../FormattedNumber/formatNumber';

/** A file size for people: 1.5 MB, 820 kB, 12 bytes, in steps of 1000 (1 MB is 1,000,000 bytes, as macOS, iOS and
 *  Android count, so a maxSize of 5_000_000 is "5 MB"), with the names Intl gives every locale. In that locale's digits and units, en-US without one, the same as
 *  FormattedNumber format="bytes": formatFileSize(1_500_000, "id-ID") is "1,5 MB" (GR20). */
export function formatFileSize(bytes: number, locale?: string): string {
  if (!(bytes >= 0)) return '';
  // Only a string: sizes.map(formatFileSize) passes each index here. Without one, en-US, so it's written one way.
  return formatNumber(bytes, typeof locale === 'string' && locale ? locale : 'en-US', { format: 'bytes' });
}
