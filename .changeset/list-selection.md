---
"serupa-ds": minor
---

Added: List `selectionMode`, for rows people pick to act on several at once (files to move, messages to archive). With `"multiple"` each row gets a checkbox named by its title and the list becomes a grid with one Tab stop: Up and Down move between rows, Right and Left reach a row's checkbox, link and actions, Space picks, Shift picks a run, and Ctrl or Cmd+A picks every row. `"single"` picks one row. Give each ListItem a `value`; `selected`, `defaultSelected` and `onSelectedChange` hold the picked values. New `ListSelectAll` is the "Select all" box above it, checked when every row is picked and a dash when some are.
