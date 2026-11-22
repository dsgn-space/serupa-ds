---
"@diki-stwn/serupa-ds": patch
---

InlineEdit's `editing`, MentionInput's `value`, Select's `value`, ToggleButton's `pressed` and TransferList's `value` now warn once in development when a controlled value turns undefined, as the other form controls already do. Before, the control quietly fell back to its own old state and stopped matching the app's.
