---
"serupa-ds": patch
---

RangeCalendar hydrates on the month the server drew when it has no value, `month` or `defaultMonth`, then moves to the visitor's month (and calls `onMonthChange`). Before, a server whose today was in another month than the visitor's (a UTC server late on the 31st, a visitor in Jakarta on the 1st) made hydration fail, and React drew the calendar again in the browser.
