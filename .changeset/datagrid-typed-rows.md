---
"serupa-ds": minor
---

DataGrid is typed by its rows: with `rows={people}`, a column's `key` (and `rowKey`) must be one of a person's fields, and `format(row)` and `onRowsChange(rows)` get people, with no casts. Rows typed `Record<string, unknown>`, as before, work as they did.
