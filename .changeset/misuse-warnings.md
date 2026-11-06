---
"serupa-ds": patch
---

Four common mistakes now warn once in development, as Tabs already does for a value that matches no tab (GR161). Production builds don't change.

- Select: a controlled `value` that matches none of its options (`select-value`). The `<select>` shows its first option then, and a form sends that, while the app holds the value it passed.
- Combobox: two options with the same value (`combobox-duplicate-value`). Picking the second one showed the first one's label and marked both as selected.
- Calendar, DatePicker and DateRangePicker: a date string that isn't a real `yyyy-mm-dd` day, such as `"tomorrow"`, `"2026-13-01"` or `"2026-02-31"` (`date-string`). The field showed no date and said nothing.
- NumberInput: `min` above `max` (`number-range`), which no value fits.
