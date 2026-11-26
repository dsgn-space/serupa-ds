---
"@diki-stwn/serupa-ds": patch
---

Fixes from the Gemini review:

- **Form drafts never keep a shown password.** A password shown with PasswordInput's Show password button became a text field and was saved in the draft. Fields marked `current-password` or `new-password` are now left out too.
- **EventCalendar's arrows point the right way in right-to-left pages.** Previous and Next were turned round twice, so they pointed left-to-right.
- **FileUpload takes nothing inside a disabled `<fieldset>`**, as a native file input. Before, a dropped or pasted file was still added.
- **PhoneInput reads a pasted number in any script.** A number written in Arabic-Indic, Persian or full-width digits is read correctly, and so is an Argentine mobile in international form with its 9 (+54 9 11 2345-6789). Before, the first came out empty and the second was one digit too long.
