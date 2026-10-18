---
"serupa-ds": patch
---

- Dialog and Drawer now call `onOpenChange(false)` when the browser closes the `<dialog>` on its own (`dialog.close()`, a form with `method="dialog"`, or an Escape the browser doesn't let them cancel), so `open` no longer stays true while nothing is on screen, and the button that opened it opens it again.
- Tooltip takes the Escape that hides it, so inside a Dialog, Drawer or Menu one Escape hides only the tooltip and the next one closes the Dialog.
- Dialog, Drawer, Image and SegmentedControl set a forwarded ref through the shared helper, like the other components. Function refs and object refs both keep working.
