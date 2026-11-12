---
"serupa-ds": minor
---

Drawer and NotificationCenter take `placement`, the API naming table's name for where an overlay sits, in place of `side`, which still works and is deprecated (removed in 15.0.0). `placement` also takes `start` and `end`: the edges the reading starts and ends at, so `placement="start"` opens a navigation drawer from the left in a left-to-right page and from the right in a right-to-left one, and its swipe to close follows.
