---
"serupa-ds": patch
---

Table: when a TableVirtualBody is swapped for a TableBody that draws every row, the table no longer keeps the virtual body's `aria-rowcount`, so screen readers stop announcing rows that aren't there.
