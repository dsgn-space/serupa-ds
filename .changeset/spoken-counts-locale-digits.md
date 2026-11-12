---
"serupa-ds": patch
---

Counts that screen readers hear now use the locale's digits, as Combobox's results count already did. This covers CascadeSelect's "Level 1" column names (used when `levels` isn't given), Chat's "3 new messages", DataGrid's "4 cells copied" and "pasted", EventCalendar's "2 events" and "+3 more", and Toast's "+2 more" and "12 times". For example, in `ar-EG` with the English labels, a column is now "Level ١". Each of these labels gets a second argument, `formatted`: the count already formatted for the locale. If you supply your own labels, use `formatted` where you show the number. Functions that take only the count still work, but they show it in Latin digits.
