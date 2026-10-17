---
"@diki/design-system": patch
---

- Fixed: Calendar, DatePicker and DateRangePicker start the week on the locale's day in Firefox too (Monday for de-DE, for example); Firefox has no Intl.Locale week info, so they always started on Sunday.
