---
"@diki-stwn/serupa-ds": minor
---

TableActionBar can select every matching row across pages and stay in view. Give it `total` and `onSelectAll` and it offers "Select all 1,240", then says "All 1,240 selected"; `sticky` keeps it at the top of a long table, offset by the new `--table-action-bar-top` token. TableToolbar passes them on as `matchingCount` and `onSelectAll`, and the List with search and filters pattern uses them. Two new labels, `tableSelectAll` and `tableAllSelected`, come in every language pack.
