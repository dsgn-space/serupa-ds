---
"serupa-ds": patch
---

- Fixed: DatePicker: in Kyrgyz (`ky`), which writes dates year-day-month, typing the date the field shows read it as year-month-day (2026-05-01 for 5 January became 1 May). A leading 4-digit year now reads as ISO only when the locale doesn't write its year first. DateRangePicker reads dates the same way.
- Fixed: TimePicker: times that some locales write didn't read back when typed: Bulgarian's 12-hour form (the "ч." after the time), Assamese ("AM ৯.০৫", with AM first), the Japanese calendar's 12-hour clock ("午前0:00", which starts at 0) and Dzongkha (words for "hour" and "minute"). The parser now reads AM and PM before or after the time, drops the locale's own words around a time, and takes 0 as the first hour of a half. A new test checks round trips in 104 locales, in the browser and in Node.
