---
"serupa-ds": minor
---

`useUnsavedChanges(unsaved)`: Dialog's "Discard changes?" question for a form or page that isn't in a Dialog (13). While there are changes, leaving the page asks the browser's question, and `await confirm()` asks "Discard changes?" before the app moves away (true on Discard). Render the `dialog` it returns in the form.
