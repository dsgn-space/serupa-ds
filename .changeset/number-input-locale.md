---
"serupa-ds": minor
---

- Fixed: NumberInput misread thousands separators. "1,500" became 2 (read as 1.5, then rounded to the step), "1.000" in Indonesian or German became 1, and "1 000" was rejected. It now reads the locale's decimal and group marks. A group mark counts as grouping only when the digits are grouped in threes, so "9.5" and "9,5" are still 9.5 everywhere. Digits in other scripts, a currency symbol and % are accepted.
- Fixed: NumberInput shows the number with the locale's decimal mark: "9,5" in de-DE and id-ID, where it used to show "9.5".
- Added: NumberInput `locale`, which sets the marks that are read and written. The default is the nearest `SerupaProvider`'s locale, else the browser's.
- Added: NumberInput `formatOptions`, which takes Intl.NumberFormat options for display, such as currency (`{ style: "currency", currency: "IDR" }` shows "Rp 1.500"), grouping, or percent. It also sets `aria-valuetext`.
