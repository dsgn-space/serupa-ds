---
"serupa-ds": patch
---

- Changed: Popover places itself with the shared anchored-layer helper that TimePicker and DateRangePicker use, so all of them follow the same rules for placing, flipping and closing on an outside press. Nothing changes for people using it, except that changing `placement` while a Popover is open no longer moves focus back to its first control.
- Popover's tests moved next to it, into `Popover.test.tsx` (Vitest).
