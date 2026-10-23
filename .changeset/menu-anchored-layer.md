---
"serupa-ds": patch
---

- Changed: Menu places itself with the shared anchored-layer helper, like Popover, TimePicker and DateRangePicker. Nothing changes for people using it, except that changing `placement` while a Menu is open no longer moves focus back to its first item.
- Menu's tests moved next to it, into `Menu.test.tsx` (Vitest).
