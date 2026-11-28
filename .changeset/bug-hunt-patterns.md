---
"@diki-stwn/serupa-ds": patch
---

Fixes in patterns, from a bug hunt:

- **AccountSecurity**: a device signed out on its own stays signed out after "Sign out everywhere else".
- **Checkout**: a saved card that has expired, or is no longer in the list, stops at the details with a message instead of going on to Place order.
- **ProductCompare**: with "Only what differs" on and one product left, every feature shows again.
- **Timesheet**: hours like 6.4 + 9.8 + 7.8 add up to exactly 24, so the day isn't rejected, and a 40-hour week doesn't say "0 hours under".
- **SignAgreement**, **Quiz** and **ReturnRequest**: fixing one problem after a failed submit keeps focus in the field instead of moving it to the error summary mid-word.
- **Approvals**: a decided request the app removes from `requests` still shows under Decided, where it crashed.
- **PasswordReset**: `resetPasswordRules` rejects the whole email address however short its name part, an email with spaces around it, and a password of only spaces.
- **Profile**: the photo preview's address is made and let go in step, so none leaks in Strict Mode and one shown again after `<Activity>` still loads.
