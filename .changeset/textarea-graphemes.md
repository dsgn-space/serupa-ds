---
"serupa-ds": patch
---

- Fixed: Textarea's count counted hidden code units, so 👨‍👩‍👧🇮🇩 showed as "12 / 10". It counts characters as people see them now ("2 / 10") (R32).
- Changed: Textarea's `maxLength` counts the same characters as the count, so typing stops where the count says it's full. Text pasted past it is cut at the end of the paste, and an input method's text once it's confirmed. The `<textarea>` no longer carries the browser's `maxlength`.
