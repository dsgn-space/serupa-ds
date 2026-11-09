---
"serupa-ds": patch
---

toast.undo: an action is no longer lost. When a new `toast.undo` with the same `id` replaces an open one, the first one's `commit` now runs. When no Toaster shows the toast (none is mounted, or the page's own Toaster unmounts), its `commit` runs a moment later and a warning appears in development. Before, the action was done only on `pagehide`, or never.
