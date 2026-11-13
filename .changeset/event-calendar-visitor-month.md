---
"serupa-ds": patch
---

EventCalendar with no `month` or `defaultMonth` hydrates without a mismatch when the server's today is in another month than the visitor's (a UTC server late on the 31st, a visitor ahead of it on the 1st). It first draws the month in the server's HTML, then moves to the visitor's month and calls `onMonthChange` with it. The title carries the shown month as `data-month`.
