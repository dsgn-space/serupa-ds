---
"serupa-ds": patch
---

Image and Popover make their media queries once instead of on every render: Image's reduced-data query, and the narrow-screen query of a Popover with `sheet="mobile"`. Every Image now shares one pair of data-saver listeners instead of adding two each. Both still follow the setting when it changes.
