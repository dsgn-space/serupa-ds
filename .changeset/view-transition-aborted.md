---
"serupa-ds": patch
---

`withViewTransition` no longer leaves an unhandled promise rejection when the browser aborts a transition, for example when the window is resized partway through. The change still applies, as it did before.
