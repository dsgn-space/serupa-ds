---
"serupa-ds": patch
---

FileUpload: a file name now stays whole while it fits, and a long one is cut only between characters people see, as in Attachment. Before, the name was always split by code point, which broke Devanagari vowel signs, ZWJ emoji and decomposed accents, even when the name fitted.
