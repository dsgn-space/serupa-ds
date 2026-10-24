---
"serupa-ds": minor
---

- Added: FileUpload: `invalid` (a solid danger outline, and `aria-invalid` on the choose button), `required` (on the native input, and a hidden "Required" in the button's description) and `readOnly` (the files are listed and submitted, but the button opens no picker, drops are ignored and there are no remove buttons). New token `--file-upload-zone-border-invalid` and label `required`. Inside a Field with an error or `required`, the button now says so, and Field's `invalid` and `aria-required` no longer reach the wrapper `<div>` (React warned about `invalid`).
