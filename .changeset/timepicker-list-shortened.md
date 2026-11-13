---
"serupa-ds": patch
---

TimePicker: when a new `min`, `max` or `step` shortens the list while it's open, the highlight moves to the last time left. It stayed past the end, so screen readers were pointed at an option that no longer existed and Enter picked nothing.
