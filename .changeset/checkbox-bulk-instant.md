---
"serupa-ds": patch
---

Fixed (Checkbox): the fill and border ease only on the box under the pointer or keyboard focus. A box changed from elsewhere, such as every row's box after "select all", changes at once as a native checkbox does. Before, ticking 1,000 boxes started 2,000 transitions in one frame: about 3.9 seconds on a mid-range phone, now about 0.9.
