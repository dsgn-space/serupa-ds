---
"@diki-stwn/serupa-ds": patch
---

TimeZonePicker makes its list of about 420 zones when the field is first focused, pointed at or opened, rather than on every first render, so a page with several pickers no longer spends its first render formatting zones nobody has opened.
