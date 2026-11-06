---
"serupa-ds": patch
---

Tour works inside a shadow root. A step's `target` selector is looked up in the tour's own shadow root, so the step points at its element and rings it instead of sitting in the middle of the screen, and when the tour ends focus goes back to the button that opened it, not to the shadow host.
