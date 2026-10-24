---
"serupa-ds": patch
---

- Fixed: Toast: a toast with an `action` (such as Undo) stays until it's closed, unless you give it a `duration`. Before, it went after 5 seconds, usually before keyboard and screen reader users could reach the button (WCAG 2.2.1). F8 now moves focus to the newest toast and back (Escape goes back too), and the first toast with an action adds "Press F8 to reach it." to its announcement. New label `toastShortcut` (Indonesian in `idLabels`) and component token `--toast-focus-ring` for the focused toast's ring.
