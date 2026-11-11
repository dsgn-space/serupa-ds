---
"serupa-ds": minor
---

- Added: `serupa-ds/stylelint` has a fourth rule, `serupa/no-raw-motion`. In `transition` and `animation` it flags a duration or delay written out (`300ms`), an easing written out (`ease`, `cubic-bezier()`, `linear()`, `steps()`) and `transition: all`, and names the motion role or easing token to use instead. It is on as a warning, so upgrading doesn't fail an app's lint; it becomes an error in the next major. `none`, `0s`, a duration under 1ms and the keyword `linear` pass.
