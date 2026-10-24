---
"serupa-ds": patch
---

- Fixed: SegmentedControl: your `onKeyDown` runs before the control's own key handling, so `preventDefault()` in it stops that key, as on the other inputs. `onFocus` and `onBlur` fire only when focus enters or leaves the control, not as the arrow keys move between segments.
