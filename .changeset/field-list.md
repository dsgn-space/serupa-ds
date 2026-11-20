---
"@diki-stwn/serupa-ds": minor
---

- Added: FieldList, rows people add and remove in a form (phone numbers, guests, invoice lines). Each row is a group named by `itemLabel` ("Phone 2") with its own Remove button ("Remove Phone 2"), and Add comes after the last row. Add moves focus to the new row's first field, Remove moves it to the row before (or to Add), and each change is announced. `min` hides Remove and `max` keeps Add focusable with the reason ("Limit reached: 5."). It takes errors by row and for the whole list, native form names (`phones[1].number`) and optional reordering (`reorderable`). It has 8 component tokens, and one new label, `fieldListLimit`, in every language pack.
