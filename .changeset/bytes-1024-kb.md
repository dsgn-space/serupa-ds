---
"serupa-ds": patch
---

`formatFileSize` without a locale now writes kilobytes as "kB", the same as with a locale and as FormattedNumber's `format="bytes"`. Before, it wrote "KB", so one app could show both spellings. Sizes still step by 1024, and the FileUpload and FormattedNumber guides now say so: a `maxSize` of `5 * 1024 * 1024` reads "5 MB".
