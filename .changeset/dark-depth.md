---
"serupa-ds": minor
---

New alias `surface-hover` (zinc-50 in light, zinc-800 in dark) for a row under the pointer, a selected row and a striped row. List and InlineEdit hovers, Table hovers, stripes and selection, and EventCalendar's "+N more" use it. Since dark `surface-muted` became zinc-950, below the page, these rows had turned darker than the page in dark and read as holes. They now step up off the page again, as they do in light. If your own CSS uses `surface-muted` for a hover or a selected row, switch it to `surface-hover`.
