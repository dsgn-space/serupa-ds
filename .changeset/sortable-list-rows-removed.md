---
"serupa-ds": patch
---

SortableList: when rows are taken away while one is held past the new end, the held row's place moves back inside the list. Dropping it reports the place it lands (`to` was past the end of the list) and announces the right position.
