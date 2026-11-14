---
"serupa-ds": patch
---

CommandPalette and SortableList redraw only the rows that change. In CommandPalette, moving the highlight with an arrow key or the pointer used to draw every command again. Now it draws the two rows the highlight moves between, which halves the time per key with 300 commands. In SortableList, each step of a moved item, and each pointer move during a drag, used to call `renderItem` for every row. Now it calls it only for the rows whose place changes.
