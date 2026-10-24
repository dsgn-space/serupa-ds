---
"serupa-ds": patch
---

- Fixed: DatePicker and DateRangePicker: in locales with another calendar or other digits (th, ja-u-ca-japanese, fa, ar-EG, bn and others), leaving the field moved the date. Thai wrote the Buddhist year 2568, which read back as the year 2568; Persian and Arabic digits weren't read at all, so the value was lost. The field now always writes Gregorian years with Latin digits, and reads digits typed in any script. Month and weekday names in the calendar stay localized.
- Fixed: Calendar: in those locales the title and each day's label named the month and year in the locale's own calendar ("พฤศจิกายน 2568", "آبان ۱۴۰۴"), while the grid showed Gregorian days. They now name the Gregorian month shown, still in the locale's language.
