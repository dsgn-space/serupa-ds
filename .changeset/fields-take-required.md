---
"@diki-stwn/serupa-ds": minor
---

CascadeSelect, DateField, PeriodPicker and SignaturePad take `required`, like Input, Select and ColorPicker: a form isn't sent while they're empty, they're marked invalid and the first one takes focus, and filling them clears it. `aria-required` reaches the button (CascadeSelect, PeriodPicker), the boxes (DateField) or the typed name (SignaturePad). A required Field still sets only `aria-required`, as it does on an Input; add `required` for the form's check.
