---
"@diki-stwn/serupa-ds": minor
---

CheckboxGroup takes `readOnly`, which passes to every box, as RadioGroup's does. TransferList takes `readOnly` (the boxes are read-only, Add and Remove are left out, and the form still sends the chosen values) and `required` (the form isn't sent while Chosen is empty; both lists are marked invalid and the first available box takes focus).
