---
"@diki-stwn/serupa-ds": minor
---

- Changed: a row or item under the pointer is shaded `zinc-100` in light themes, where `zinc-50` barely showed on white. `surface-hover` and `surface-hover-raised` are `zinc-100` in light (dark is unchanged), so List, Table, InlineEdit, Sidebar, Navbar, TreeView and every other hover that reads them follow, and so do selected and striped List and Table rows. In light this is the same fill as `highlight`, so a hovered Sidebar, Navbar or TreeView item matches the current or selected one; only the current one draws the bar, with more contrast.
- New: `text-muted-shaded` (`zinc-600` light, `zinc-400` dark), grey text inside a shaded row, where `text-muted` on `zinc-100` would be 4.4:1. List, Table and InlineEdit set it on their hovered, selected and striped rows (through `--list-text-muted-shaded`, `--table-text-muted-shaded` and `--inline-edit-text-muted-shaded`), and it reaches muted text in your own Table cells too.
