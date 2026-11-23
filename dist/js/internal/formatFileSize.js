// src/internal/formatFileSize.ts
import { formatNumber } from "../components/FormattedNumber/formatNumber.js";
function formatFileSize(bytes, locale) {
  if (!(bytes >= 0)) return "";
  return formatNumber(bytes, typeof locale === "string" && locale ? locale : "en-US", { format: "bytes" });
}
export {
  formatFileSize
};
//# sourceMappingURL=formatFileSize.js.map
