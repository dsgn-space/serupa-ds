---
"serupa-ds": minor
---

Added (Drawer): `snapPoints` makes a bottom drawer a sheet that stops at given heights, as shares of the screen (`[0.4, 0.9]`). A touch drag on its handle or header moves it between them and carries on at the finger's speed; dragged below the shortest stop, it closes. A press on the handle ("Expand", "Collapse") goes to the next stop, so it works from the keyboard. `snap`, `defaultSnap` and `onSnapChange` control it.
