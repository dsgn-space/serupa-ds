---
"serupa-ds": patch
---

Toast: the toasts left glide into place over 200ms again in an app whose build minifies CSS. A minifier writes the 200ms token as `.2s`, which was read as 0.2ms, so they snapped. Tabs: a tab picked near the edge of a scrolling list stops clear of the 32px fade; the fade's width in `rem` was read as 2px, so the selected tab's label sat half faded.
