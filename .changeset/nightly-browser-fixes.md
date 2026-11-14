---
"serupa-ds": patch
---

Fixes found by the nightly runs in Safari's engine and the oldest supported Chrome:

- Buttons, badges, switches, checkboxes, radios and the other filled controls keep their colors when printed in Chrome before 136, which reads only the prefixed `-webkit-print-color-adjust`.
- PasswordInput inside a shadow root: in Safari, showing or hiding the password keeps the text that was selected, rather than moving the caret to the end.
- TableOfContents rail: in Safari, a link that takes focus in a panel taller than the window is scrolled into the panel's view.
- Textarea with `autoResize`, and the other parts that refit when a web font arrives (cut labels, Pagination, Stepper, anchored layers): in Safari they refit once the font is in, where they could measure before it was.
