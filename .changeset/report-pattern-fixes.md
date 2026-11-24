---
"@diki-stwn/serupa-ds": patch
---

Fixes in the patterns and blocks:

- Checkout reads "1/27" typed in the expiry date as 01/27: a slash after one digit ends the month.
- Profile keeps showing a new photo once it's saved, rather than a broken image.
- ShareDialog keeps someone removed and then invited again: closing doesn't remove them, and they are listed once, with the new access.
- Donation's fee that covers the card's cut isn't a cent more for the rounding of the arithmetic.
- Booking starts at the guests a place sleeps when that's fewer than two, and never books more.
- Transactions that arrive after loading show the newest month, not every month at once.
- TeamMembers lists an invite revoked and then sent again, with the new role, and doesn't revoke it when the toast closes. Removing the last member that can be removed moves focus to the heading.
- AddressBook makes the first address added after the default was removed the default.
- Appointment says there are no free times when the only free times are before today.
- SignUp's "Not your email address" rule isn't met by the whole address when its name part is short.
- CommentThread bolds every mention at its own place: "@Ayub" isn't Ayu, and Ayu named twice is bold twice.
- DataImport numbers each row by the line it starts on in the file, past empty lines and cells of more than one line.
- DataExport says a size that rounds to 1,000 of a unit as 1 of the next: 999,950 bytes is 1 MB.
- EmailPreferences takes away the "Couldn't turn them back on" message once trying again works.
