---
"serupa-ds": patch
---

Fixed (Fab): a Fab in a corner rises above an OfflineBanner or the toasts at its edge while they show, instead of being hidden under them even when focused, and the page keeps room for both when it scrolls to a field. A Toaster puts the room its toasts take in `--dk-toaster-space-<position>` on the root for this.
