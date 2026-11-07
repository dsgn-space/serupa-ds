---
"serupa-ds": patch
---

Fixed (Checkbox): the fill and border ease only on the box under the pointer or keyboard focus. A box changed from elsewhere, such as every row's box after "select all", changes at once as a native checkbox does. Before, ticking 1,000 boxes started 2,000 transitions in one frame: about 3.9 seconds on a mid-range phone, now about 0.9.

Fixed (Table): a body row's background eases only while the pointer is over the table body. "Select all" in the header, or a selection set from script, now repaints every row at once instead of starting a transition per row. The audit measured select all on a 1,000-row table at 4x CPU slowdown at about 5.1 seconds, and about 2.3 with these transitions off.
