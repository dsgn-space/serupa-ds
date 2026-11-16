---
"serupa-ds": patch
---

Pointer feedback that was missing or wrong. Every TagGroup tag is now 24px tall like other small controls (a removable or pictured tag was 26px): the × is drawn 22px inside the tag's border and still takes a 24px press, the picture sits over the border, and the tag's words are 14/20. InlineEdit's text button fills one step past its hover while pressed (new `--inline-edit-bg-pressed`), as List and Sidebar rows do. FileUpload's drop area fills while pressed (new `--file-upload-zone-bg-pressed`), and a click anywhere on it, its icon, title and hint included, opens the file picker; before, only its padding did. ColorPicker's disabled custom-color well shows the disabled cursor instead of a pointer.
