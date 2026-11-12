---
"serupa-ds": patch
---

File sizes are written one way everywhere. `formatFileSize` without a locale now writes what `FormattedNumber format="bytes"` writes in en-US, so it goes on to PB (2 PB, not 2000 TB). Sizes under 1 kB use the long name, "512 bytes" and "1 byte", in place of the unpluralised "512 byte" (from `FormattedNumber`) and "512 B" (from `formatFileSize`). FileUpload's and Attachment's sizes change with them.
