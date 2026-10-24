---
"serupa-ds": patch
---

- Fixed: Slider: your `onKeyDown` runs before the slider's own key handling, so `preventDefault()` in it stops that key, as on the other inputs. `onFocus` and `onBlur` fire only when focus enters or leaves the slider, not when Tab moves between a range's two thumbs.
