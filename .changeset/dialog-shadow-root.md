---
"serupa-ds": patch
---

Dialog: inside a shadow root, focus goes back to the button that opened it when the dialog is taken off the page while open. Before, it went to nothing, because Dialog kept `document.activeElement`, which is the shadow host there (GR95).
