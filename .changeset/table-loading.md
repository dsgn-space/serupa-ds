---
"serupa-ds": minor
---

Table: loading, empty and failed states. `busy` sets `aria-busy` on the table. `TableLoadingRows` draws placeholder rows as tall as real ones at either size, named once for screen readers ("Loading projects"), so nothing jumps when the data arrives. `TableMessageRow` is one row across every column for an EmptyState, or for a danger Alert with Retry when the rows didn't load. The README shows the three states together, and a story shows them too.
