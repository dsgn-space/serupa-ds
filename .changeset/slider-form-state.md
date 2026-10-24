---
"serupa-ds": minor
---

- Added: Slider: `invalid` (a danger fill and thumb ring, and `aria-invalid` on the thumbs) and `readOnly` (focusable and read out with `aria-readonly`, but keys and presses don't move it, and a form still gets the value). New token `--slider-invalid`. Inside a Field with an error the slider turns invalid, and Field's `invalid` and `aria-required` no longer reach the root `<div>` (React warned about `invalid`; a slider always has a value, so `required` has no effect).
