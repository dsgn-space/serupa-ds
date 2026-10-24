---
"serupa-ds": patch
---

- Fixed: FileUpload: `ref.current.focus()` and `autoFocus` focus the choose button. Before, they focused nothing, so a form library that focuses the first invalid field after a failed submit (React Hook Form, Formik) left people where they were. The ref is still the root `<div>`.
