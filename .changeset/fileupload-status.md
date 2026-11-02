---
"serupa-ds": minor
---

FileUpload shows each file's upload: `fileStatus` returns `{ state: "uploading" | "done" | "error", progress?, message? }` for a file, which shows a progress bar named by the file, "Uploaded", or a failure message with a retry button (`onRetry`). Screen readers hear a file finish or fail. `thumbnails` shows a picture of each image file in place of its type icon. Five new labels (`fileDone`, `fileError`, `fileRetry`, `fileUploaded`, `fileFailed`) in every language pack.
