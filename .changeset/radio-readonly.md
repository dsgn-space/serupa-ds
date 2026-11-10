---
"serupa-ds": minor
---

RadioGroup has `readOnly`: the radios stay focusable, the group says it with `aria-readonly`, and a form still sends the choice, unlike `disabled`, while arrows, Space and clicks don't change it and `onValueChange` doesn't run. A Radio's own `readOnly` works the same way outside a group.
