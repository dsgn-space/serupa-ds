---
'serupa-ds': minor
---

Toast fixes:

- `toast.undo` now follows `autoDismiss` and `duration` like any toast, the Toaster's unless it sets its own, and accepts `autoDismiss`. A Toaster with `autoDismiss={false}` (for WCAG 2.2.1 Timing Adjustable) keeps undo toasts until they're closed, instead of committing after 5 s.
- While toasts show at the top or bottom edge, the page's scroll padding there is the room they take, so tabbing to a control under a toast scrolls it clear (WCAG 2.4.11 Focus Not Obscured). A page's own `scroll-padding` still wins.
- `toast.promise`: a `success` or `error` message function that throws no longer leaves the loading toast up forever with an unhandled rejection. A throwing `success` message shows the `error` message for what it threw, a throwing `error` message closes the toast, and development warns (`toast-promise-threw`).
