---
"@diki-stwn/serupa-ds": patch
---

NaN, which `Number()` gives for an empty or unreadable answer, now counts as no number:
- NumberInput shows an empty field, with no `aria-valuenow` and nothing sent with the form, instead of "NaN".
- Calendar, EventCalendar and the date pickers no longer break with "Invalid time value" on a NaN `weekStartsOn`. They start the week on the locale's first day, as they do with none.
- EventCalendar's `maxPerDay` falls back to its default.
- LoadMore no longer shows "Showing 20 of NaN". With `infinite`, it no longer loads over and over on a NaN `count`.
- FilterBar shows no count.
