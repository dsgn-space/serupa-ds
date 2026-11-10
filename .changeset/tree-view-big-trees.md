---
"serupa-ds": patch
---

TreeView: big trees are quicker. A row out of view isn't laid out until it scrolls near (`content-visibility: auto`, holding its row height), which halves the time a tree of 10,000 rows takes to open. A key press or pick now tells only the rows it changes, looks rows up at once rather than through every row, and Up and Down no longer make the page work out its styles.
