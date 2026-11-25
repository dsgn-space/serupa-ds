---
"@diki-stwn/serupa-ds": patch
---

Fixes from the Gemini review:

- **Form drafts never keep a shown password.** A password shown with PasswordInput's Show password button became a text field and was saved in the draft. Fields marked `current-password` or `new-password` are now left out too.
- **EventCalendar's arrows point the right way in right-to-left pages.** Previous and Next were turned round twice, so they pointed left-to-right.
- **FileUpload takes nothing inside a disabled `<fieldset>`**, as a native file input. Before, a dropped or pasted file was still added.
