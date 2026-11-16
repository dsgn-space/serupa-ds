---
"@diki-stwn/serupa-ds": patch
---

Combobox (`value`, `inputValue` and `open`), FilterBar, RangeCalendar, Carousel (`index`), ChatComposer, MaskedValue (`revealed`) and SidebarItem (`open`) now warn once in development when a controlled prop turns `undefined`, or the other way round, as the app's state loads or resets. Before, they quietly fell back to their own, often stale, value.
