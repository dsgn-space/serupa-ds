---
"@diki-stwn/serupa-ds": patch
---

DatePicker, DateRangePicker, PeriodPicker, TimePicker, Pagination (`page`), Tooltip (`open`), Tabs, CascadeSelect (`value` and `open`) and TreeView (`value` and `expanded`) now warn once in development when a controlled prop turns `undefined`, or the other way round, as the app's state loads or resets. Before, they quietly fell back to their own, often stale, value.
