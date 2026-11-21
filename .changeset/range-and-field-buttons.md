---
"@diki-stwn/serupa-ds": minor
---

DateRangePicker's popup is now a RangeCalendar, and the buttons inside fields are all InputActions.

- **One way to pick a range:** the first pick is the start, a day before it moves the start, and the next day on or after it is the end. DateRangePicker already worked this way. RangeCalendar (beta) used to take the two picks in either order and now follows the same rule.
- **Fixed:** in DateRangePicker's popup, the ends and the days between are now named in words ("Start date", "in the range", "End date") as well as by color, and with two months only the outer arrows show, as in RangeCalendar.
- **One button inside a field:** SearchInput's clear button, PasswordInput's eye, and the buttons of Combobox, DatePicker, DateRangePicker and TimePicker are now `InputAction`s. Each keeps its own tokens (`--search-input-clear`, `--combobox-chevron`, `--date-picker-button`, …) and its class names. An icon `InputAction` is now its icon with 4px round it (22, 24 or 28px by size), the same size those buttons always were, where it used to fill the field's height. Its padding is the new `--input-action-icon-padding` token.
- The months in DateRangePicker's popup are inside `.dk-date-range-picker__calendar` (a RangeCalendar); `.dk-date-range-picker__months` and `.dk-date-range-picker__status` are gone. `--date-range-picker-months-gap` and `--date-range-picker-status-color` still set the gap and the status color.
