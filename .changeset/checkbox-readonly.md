---
"serupa-ds": minor
---

- Added: Checkbox: `readOnly` now works. The browser's `readonly` does nothing on a checkbox, so a click or Space used to toggle it anyway; now the box stays as it is, `onChange` doesn't run, and it says `aria-readonly`. It stays focusable, and a checked read-only box is still submitted with a form.
