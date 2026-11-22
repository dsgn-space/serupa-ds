---
"@diki-stwn/serupa-ds": minor
---

FileUpload draws each chosen file as an Attachment, so a file looks the same in both: the row now says its kind before the size ("PDF · 240 kB"), and its classes are Attachment's (`srp-attachment__*`) inside `srp-file-upload__item`. FileUpload's row tokens still set the row's colors, corners and padding. Attachment gains `thumbnail`, shown in place of the kind's icon, and `done`, which says "Complete" with a check after the size, with a new token, `--attachment-done`.
