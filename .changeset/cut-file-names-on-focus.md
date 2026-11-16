---
'@diki-stwn/serupa-ds': patch
---

Attachment and FileUpload: a file name cut in the middle now shows in full in a tooltip on keyboard focus too, not only as a title on hover. In an Attachment link the link's focus shows it; elsewhere a cut name takes a tab stop of its own, with a focus ring, as TruncatedText does. New token `--file-upload-focus-ring`.
