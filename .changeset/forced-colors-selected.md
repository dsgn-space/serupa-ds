---
"serupa-ds": patch
---

- Fixed: Calendar, SegmentedControl, Stepper: in Windows high contrast (forced colors), the selected day, the checked segment's label and the current step's number show again. The browser put a Canvas-colored backplate behind the text, the same color as the HighlightText it was drawn in, so it vanished. DatePicker's and DateRangePicker's calendars are fixed with Calendar.
- Changed: Tooling: component tests can turn on real forced colors with `forcedColors(during)` from `tools/test/vitest/helpers.ts`.
