---
"@diki-stwn/serupa-ds": minor
---

- Changed (Drawer): the panel's shadow falls toward the page, from the one light above. A bottom sheet casts it upward, where before it fell off the bottom of the screen and left the sheet's top edge flat; a side panel casts it sideways toward the page, mirrored in right-to-left text; a top panel's still falls down. `--drawer-shadow` still sets one shadow for every side.
- New tokens: `elevation-modal-up`, `elevation-modal-left` and `elevation-modal-right`, the modal shadow cast up, left and right, for your own panels against an edge. They follow `data-shadow="brand"` like the other shadows.
