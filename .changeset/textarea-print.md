---
"serupa-ds": patch
---

A printed Textarea shows all of its text. It used to print only the lines in view, so a long answer was cut off on paper. Printed, the field now grows to its text, keeping `rows` lines at least so a blank one still leaves room to write. This works where the browser supports `field-sizing: content`.
