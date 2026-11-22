---
"@diki-stwn/serupa-ds": patch
---

SortableList: the row being moved, from the keyboard or the pointer, now carries the one focus ring around the whole row, and its handle's own ring hides, instead of a primary border with the handle's ring inside it. A row picked up with Space can now be dragged with the pointer too: dragging its handle carries it on, and dragging another row's handle puts it back and drags that row. Each row starts 8px before its handle (was 4px; `--sortable-list-item-padding-start`).
