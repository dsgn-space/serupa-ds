---
"serupa-ds": minor
---

- Fixed: a burst of toasts stacked past the edge of the screen, where they couldn't be read or closed (12 in a row put the first at -80px). At most 3 show now (R30).
- Added: `limit` on Toaster (default 3). The newest toasts show, and older ones wait under a "+2 more" line until there's room (`labels.moreToasts`).
- Changed: the same message again (same words and tone, with no `id` or `action`) adds a count to the toast that's showing ("Network error ×12") and starts its time over, instead of adding a toast. It isn't announced again.
- Fixed: the Toaster stays clear of a phone's notch and home indicator (the safe area).
