---
"serupa-ds": patch
---

Toasts and screen-reader announcements now work while a Dialog or Drawer is open. The Toaster and the shared live regions move into the open modal, since the page behind it is inert, and move back when it closes. Danger toasts are announced assertively. Two announcements in quick succession are both said, instead of the second replacing the first.
