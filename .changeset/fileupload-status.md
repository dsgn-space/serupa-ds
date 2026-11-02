---
"serupa-ds": minor
---

FileUpload shows each file's upload: `fileStatus` returns `{ state: "uploading" | "done" | "error", progress?, message? }` for a file, which shows a progress bar named by the file, "Complete", or a failure message with a "Try again" button (`onRetry`). Screen readers hear a file finish or fail. `thumbnails` shows a picture of each image file in place of its type icon. A new label, `fileError`, in every language pack.
