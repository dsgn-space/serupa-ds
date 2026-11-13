---
"serupa-ds": patch
---

Four motion glitches. Toast: the toasts left glide into place over 200ms again in an app whose build minifies CSS (a minifier writes the 200ms token as `.2s`, which was read as 0.2ms, so they snapped). Tabs: a tab picked near the edge of a scrolling list stops clear of the 32px fade (the fade's width in `rem` was read as 2px, so the selected label sat half faded). SegmentedControl: after a click held as long as a finger holds it, the indicator rests on the whole segment, not on its pressed 95% size. Accordion: an item opened a second time grows to its height again instead of snapping open, and when one item closes as another opens, the two heights move on one curve, so what's below no longer dips and comes back.
