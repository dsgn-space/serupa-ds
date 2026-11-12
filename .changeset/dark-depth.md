---
"serupa-ds": minor
---

In dark themes the recessed surface (`surface-muted`: side panels, table headers, filled Cards, wells, the muted page behind a dashboard) is now a step below the page (zinc-950) instead of above it (zinc-800). Cards on a muted page read as raised in dark as they do in light, and a filled Card no longer looks the same as an elevated one. Light themes don't change.

The row fills that used `surface-muted` (List and InlineEdit hover, Table hover, stripes and selection, EventCalendar's "+N more") move to a new alias, `surface-hover`, which keeps their look: zinc-50 in light, zinc-800 in dark. If your own CSS uses `surface-muted` for a hover or a selected row, switch it to `surface-hover`.
