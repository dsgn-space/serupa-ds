---
"serupa-ds": minor
---

Added (Calendar, DatePicker, DateRangePicker): `presets`, a list of shortcuts beside the days. Use `true` for the built-in ones, or pass your own `{ label, value }`, where value can be a function so it follows today.

- The built-in shortcuts are Today, Tomorrow and In a week for Calendar and DatePicker, and Today, Yesterday, Last 7 days, Last 30 days, This month and Last month for DateRangePicker.
- The list is a group named "Shortcuts" that comes after the days in reading order, and goes under them on a narrow screen.
- The shortcut the value matches is pressed, and one that can't be chosen is disabled.
- DateRangePicker keeps its popup open after a shortcut, so the range shows in the months.

New labels: `presets`, `today`, `tomorrow`, `inAWeek`, `yesterday`, `last7Days`, `last30Days`, `thisMonth` and `lastMonth`, in all 20 language packs. New types: `DatePreset` and `DateRangePreset`.
