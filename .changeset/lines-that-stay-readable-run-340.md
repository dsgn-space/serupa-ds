---
"serupa-ds": patch
---

Text that stays readable where it used to be squeezed or hidden:

- **Select**: a value too long for the box now stops before the chevron instead of running under it.
- **PhoneInput**: the line between the country code and the number uses the field's own edge colour (`--phone-input-divider` defaults to `field-border`), so it shows in dark.
- **Attachment and FileUpload**: a failure message runs as a line under the file, from the name's edge to the row's, instead of a narrow column beside "Try again" and ×. The icon and the buttons centre on the name and its size, so they stay beside the file whatever its progress or error adds.
- **Toast**: an action label of more than a word or two ("Download the export") goes under the text at any width; a short one ("Undo") stays beside it.
- **Chat**: a message's time past a day shows the time of day ("9:00 AM"), since the day divider above already says which day; today's stay relative ("5 minutes ago"). The full date is still on hover.
