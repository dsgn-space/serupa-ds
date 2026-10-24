---
"serupa-ds": patch
---

- Fixed: Slider: in a Field, the label names it and the hint and error describe it. Before, a Slider in a Field had no name, so a screen reader said only "slider, 50". A single slider's `aria-describedby` now goes to the thumb, which is what screen readers read.
