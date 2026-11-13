---
"serupa-ds": patch
---

Drawer: a bottom sheet with `snapPoints` and `swipeToClose={false}` can be dragged between its stops again. Before, turning off closing by a drag also stopped the drag between stops. A drag down from the shortest stop now resists and springs back instead of closing the sheet.
