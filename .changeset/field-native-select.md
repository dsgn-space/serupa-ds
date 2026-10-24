---
"serupa-ds": patch
---

- Fixed: a native `<select>` as Field's direct child got no id, hint, error or invalid state, and the label pointed at an id nothing had, because its options made Field treat it as a wrapper. Labelable elements (select, button, meter, output, progress, textarea) are always the control now (S1).
