---
"@diki-stwn/serupa-ds": patch
---

Drawer's settle, SegmentedControl's slide and SortableList's reorder keep the layout they force before a transition when the React Compiler compiles them, so each one still moves from where it was rather than jumping to the end.
