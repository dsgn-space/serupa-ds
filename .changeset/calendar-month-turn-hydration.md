---
"serupa-ds": patch
---

Calendar: a server-rendered calendar with no value and no `defaultMonth` no longer fails hydration when the server and the visitor are in different months (the last evening of a month on a UTC server, the first morning of the next in Jakarta). It hydrates on the month the server drew, then shows the visitor's month and calls `onMonthChange` with it. With `monthYearPicker`, the same holds at a year's turn.
