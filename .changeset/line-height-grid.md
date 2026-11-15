---
"@diki-stwn/serupa-ds": patch
---

Line heights sit on the 4px grid. `type-display` is 48px on a 52px line, instead of 52.8px. With `data-type-scale="fluid"`, the line heights of `text-2xl` and up, and of the type roles built from them, now follow the size at the same ratio, rounded up to the grid. Before, they stayed fixed: a 21px heading on a phone had a 36px line, and the 33.6px display sizes had lines off the grid.
