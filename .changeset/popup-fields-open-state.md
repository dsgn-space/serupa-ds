---
"@diki-stwn/serupa-ds": minor
---

Added: DatePicker, DateRangePicker, TimePicker and PeriodPicker take `open`, `defaultOpen` and `onOpenChange(open, { reason })`, as Combobox, CascadeSelect, Menu, Popover and every other overlay do. An app can open the popup from its own button, keep it open in a walkthrough, or hear why it closed ('trigger', 'escape', 'outside', 'blur', 'select' or 'api'). Opened by `defaultOpen` or the app, focus stays where it is; opened by the person, it moves in as before. PeriodPicker already took `defaultOpen`.
