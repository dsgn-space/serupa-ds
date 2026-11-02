---
"serupa-ds": minor
---

File sizes now step by 1000, not 1024, in `formatFileSize`, FileUpload and FormattedNumber's `format="bytes"`: 1,500,000 bytes is "1.5 MB", as macOS, iOS and Android show it and as the names kB, MB and GB mean. A size that was a whole number of 1024s now reads a little higher: a `maxSize` of `5 * 1024 * 1024` reads "5.2 MB", so write `5_000_000` to keep "5 MB" in the hint and the refusal. Which files FileUpload accepts is unchanged, since `maxSize` is still compared in bytes. `formatFileSize` without a locale also writes kilobytes as "kB", the same as with a locale.
