---
"serupa-ds": patch
---

Menu items, Combobox options and SegmentedControl's selection now nest their corners in their panel's: the panel's radius less the padding and border between them (3px by default, where they were 6px, 6px and 4px). The gap around a highlighted item is even all the way round, and it stays so when a brand or `data-radius` changes the panel's corners. `--menu-item-radius`, `--combobox-option-radius` and `--segmented-control-indicator-radius` still override it.
