---
'serupa-ds': patch
---

Refs: components that hold their element and also pass it to your `ref` now keep React 19's ref cleanups. A callback ref that returns a cleanup gets that cleanup run when the element goes, not a call with `null`, and your ref is set once for the element instead of being unset and set again on every render.
