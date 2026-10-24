---
"serupa-ds": patch
---

- Fixed: Slider: `ref.current.focus()` and `autoFocus` focus the first thumb. Before, they focused nothing, so a form library that focuses the first invalid field after a failed submit (React Hook Form, Formik) left people where they were. The ref is still the root `<div>`.
