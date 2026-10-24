---
"serupa-ds": minor
---

- Added: Table: `TableSelectCell`, a checkbox cell for selecting a row ("Select Ada"), or with `header` all rows (with `indeterminate`). Its checkbox tells screen readers which rows are selected, and a row whose checkbox is checked is shaded like a selected one.
- Changed: Table: `TableRow`'s `selected` no longer sets `aria-selected`. Browsers ignore it on a plain table's rows, so it told screen readers nothing; use `TableSelectCell` for that.
