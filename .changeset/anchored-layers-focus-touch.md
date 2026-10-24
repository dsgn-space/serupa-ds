---
"serupa-ds": patch
---

- Fixed: Tab past an open DatePicker or DateRangePicker calendar left it open over the page. Focus moving past it closes it now (M2).
- Fixed: on a touch screen, a finger that started a scroll outside an open Menu, Popover, TimePicker list or date picker calendar closed it at once. It now waits for the tap: a scroll leaves it open, a tap outside closes it (O3).
- Changed: DatePicker places its calendar with the same shared code as the other popups (M6). It looks and behaves the same.
