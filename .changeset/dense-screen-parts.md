---
"serupa-ds": minor
---

Field: `warning` shows advice under the control that doesn't stop the form ("A project with this name was archived last year"), in the warning color with its icon; the control stays valid. `checking` shows words and a small spinner while an answer is checked on the server ("Checking the name…"), with `aria-busy` on the Field. Both join the control's description and are said politely. New tokens: `--field-warning-color`, `--field-checking-color`.

Calendar, DatePicker, RangeCalendar and DateRangePicker: `weekNumbers` adds a column of ISO week numbers before the days, each read as its row's header ("Week 12"). New labels: `week`, `weekShort`.

Pagination: `jump` adds a "Go to page" field after the pages; Enter goes to the page typed. New label: `goToPage`.

Combobox: with `multiple`, pasting a list ("Design, Research", or a column from a spreadsheet) picks every option it names at once and leaves what matched nothing in the field.

`useTokenValue(name, ref?)` and `tokenValue(name, element?)` read a token's value from JavaScript, as CSS resolves it where the element sits, for a canvas or a chart library; the hook follows theme changes.
