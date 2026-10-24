---
"serupa-ds": minor
---

- Added: SegmentedControl: `invalid` (a danger outline and `aria-invalid`), `required` (`aria-required`) and `readOnly` (`aria-readonly`; the arrows move focus so every option can be heard, but nothing changes the selection, and a form still gets the value). New token `--segmented-control-invalid`. Inside a Field with an error the control turns invalid; before, Field's `invalid` reached the root `<div>` and React warned.
