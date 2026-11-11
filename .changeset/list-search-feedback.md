---
"serupa-ds": minor
---

ListSearch: a search or filter lets go of the selected rows it hides, so "2 selected" never counts rows nobody can see. Archive and Export now say what they did in a toast: Archive takes the rows away with Undo and calls the new `onArchive` only once the toast closes without Undo; Export calls the new `onExport`.
