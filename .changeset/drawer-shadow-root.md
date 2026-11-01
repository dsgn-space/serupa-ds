---
"serupa-ds": patch
---

Drawer: inside a shadow root, focus goes back to the button that opened it when the drawer is taken off the page while open, and a non-modal drawer closed with focus inside it (Escape, the ×) gives focus back too. Before, focus went to nothing, because Drawer read `document.activeElement`, which is the shadow host there (GR95).
