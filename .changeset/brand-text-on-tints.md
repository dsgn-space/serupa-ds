---
"@diki-stwn/serupa-ds": patch
---

- Fixed: brand text on a tint keeps 4.5:1 in the Red, Fuchsia and Rose light themes. A primary Badge, a selected TagGroup tag, a pressed outline ToggleButton and a link in an Alert measured 4.3:1 to 4.4:1 there. Those three brands' `primary` (and `field-action`) is now their 700 shade, as it already was for Pink, Orange and the other lighter ramps, with hover, pressed and more contrast one step darker too.
- Fixed (serupa-brand): a brand it makes keeps its primary at 4.5:1 on its own tint and on the status tints too, choosing a darker shade where it has to.
