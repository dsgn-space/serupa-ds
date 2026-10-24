---
"serupa-ds": minor
---

- Added: Switch: `readOnly` now works. The browser's `readonly` does nothing on a checkbox, so a click or Space used to flip it anyway; now it stays as it is, `onChange` doesn't run, and it says `aria-readonly`. It stays focusable, and an on read-only switch is still submitted with a form.
