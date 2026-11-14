---
"serupa-ds": major
---

- **Breaking.** Prose styles only its own content: its list, table, code, heading and image rules stop at any element with a `dk-` class, so a component inside Prose looks as it does elsewhere. Before, a Pagination inside Prose got list markers and an indent, and a Kbd turned monospace. **Migration:** most apps change nothing. A page that relied on Prose restyling a component inside it styles that component with its own tokens instead, and your own `dk-`-prefixed classes on Markdown elements need another name if Prose should style them.
