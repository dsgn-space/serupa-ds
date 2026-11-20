---
"@diki-stwn/serupa-ds": patch
---

- Changed (Agent skills): the Serupa skill gains rule 9, "Respect people's work": act at once and offer Undo with `toast.undo` instead of asking "Are you sure?", show progress and "Saved" only for real work, ask only what the task needs, and keep what was typed when a flow is left. The review skill checks for the same.
- Fixed (Design principles): the Undo example calls `toast.undo` the way its API takes it, `toast.undo({ title, commit, onUndo })`.
