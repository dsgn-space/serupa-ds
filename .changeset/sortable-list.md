---
"serupa-ds": minor
---

- Added: SortableList, a list people reorder by dragging a handle or from the keyboard (Space or Enter to pick up, the arrow keys, Home and End to move, Space or Enter to drop, Escape to put back). Each step is announced ("Gemini, position 3 of 4"), focus stays on the handle, and `onReorder(items, { from, to })` is called once, on drop. It takes `items`, `getKey`, `getLabel`, `renderItem`, `disabled` and `reorderLabel`, with 16 `--sortable-list-*` tokens.
- Added: the labels `reorder`, `reorderInstructions`, `reorderGrabbed`, `reorderMoved`, `reorderDropped` and `reorderCancelled`, in English and Indonesian.
