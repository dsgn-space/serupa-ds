---
"@diki-stwn/serupa-ds": patch
---

A Popover, Menu, Tooltip, Select or any other anchored layer opened from a Button no longer slides as the Button grows back from its press. Since anchored layers moved to CSS anchor positioning in 15.0.0, they followed the pressed Button's edges; they now follow its centre, which a press doesn't move.
