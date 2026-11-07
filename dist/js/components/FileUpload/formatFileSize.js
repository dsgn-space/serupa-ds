// src/components/FileUpload/formatFileSize.ts
import { formatNumber } from "../FormattedNumber/formatNumber.js";
function formatFileSize(bytes, locale) {
  if (!(bytes >= 0)) return "";
  if (typeof locale === "string" && locale) return formatNumber(bytes, locale, { format: "bytes" });
  const units = ["B", "kB", "MB", "GB", "TB"];
  let i = 0, n = bytes;
  const rounded = () => i === 0 ? n : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
  while ((n >= 1e3 || rounded() >= 1e3) && i < units.length - 1) {
    n /= 1e3;
    i++;
  }
  return String(rounded()) + " " + units[i];
}
export {
  formatFileSize
};
//# sourceMappingURL=formatFileSize.js.map
