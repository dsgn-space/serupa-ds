---
"serupa-ds": patch
---

Tabs' and TabNav's line (and the pill's fill) slide from the tab selected before in Safari too. Safari starts no transition from `@starting-style` on a pseudo-element, so there they jumped into place; where the browser doesn't start the slide, it now runs the same one with Web Animations, from the same start, for the same time and easing. Reduced motion still puts it in place at once.
