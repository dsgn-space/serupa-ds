---
"@diki-stwn/serupa-ds": minor
---

Toast: Ctrl+Z (⌘Z on Apple devices) now chooses Undo on the newest `toast.undo` that's showing, one per press, so undo works from the keys people already use. It leaves text fields alone (their own undo wins), ignores Shift (redo) and steps aside when your app handles the keys first with `preventDefault`.
