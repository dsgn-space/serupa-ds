---
"serupa-ds": patch
---

DataGrid: an arrow key, a click or a selection change redraws only the rows that change, not every cell. In a grid of 300 rows and 8 columns a key took 80 to 140 ms in a development build and now takes about a frame.
