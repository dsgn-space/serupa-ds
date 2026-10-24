---
"serupa-ds": minor
---

- Added: DateRangePicker: `required`. Both fields get `required` and `aria-required`, so a form won't submit until each end has a date, as with a required `<input>`. Before, the prop wasn't typed and went to the root `<span>`, where it did nothing.
