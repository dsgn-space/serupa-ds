---
"serupa-ds": patch
---

- Fixed: with a Dialog or Drawer opened from inside another, Escape also asked the outer one to close, so the page closed underneath the dialog people were looking at. Now only the top one closes, and the next Escape closes the one below (R29).
