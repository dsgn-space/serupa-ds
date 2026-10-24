---
"serupa-ds": patch
---

- Changed: FileUpload: a file of the wrong type says what the field takes, in words from `accept`: "photo.heic isn't a PNG or JPG." or "notes.txt isn't an image or PDF." A type with no short name (`application/vnd.ms-excel`) keeps the general message.
