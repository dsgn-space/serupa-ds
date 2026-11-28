---
"@diki-stwn/serupa-ds": minor
---

DatePicker, DateRangePicker and FilterBar load their calendar or date-range picker the first time it opens, as a chunk of its own, instead of with the component. A project that imports DatePicker alone ships 14 KiB instead of 27, DateRangePicker 16 instead of 29, and FilterBar 31 instead of 49 (gzipped). The popup's contents can arrive a moment after the popup itself the first time it opens. `serupa-purge --components` keeps the styles of these parts.
