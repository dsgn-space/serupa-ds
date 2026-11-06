### Must fix
1. **TeamMembers.tsx:47-56: hand-built dialog**
   Problem: A `fixed` `div` with a click-to-close backdrop stands in for a dialog. It has no `role="dialog"`, no accessible name, no focus trap, no Escape key and no focus return to "Invite Member". Focus can leave it, and screen readers don't know it opened. It also uses an opaque `bg-surface` that hides the page, and the `Input` isn't in a `<form>`, so Enter doesn't submit.
   Fix: Replace it with Serupa `Dialog`, titled with the action. Put the content in a `<form onSubmit>` and make the button the submit button.
   If skipped: Keyboard and screen reader users can't use the invite flow. It is also inconsistent with every other dialog in the app.

2. **TeamMembers.tsx:41: status shown by color alone, with raw hex colors**
   Problem: An 8px dot in `#16a34a` or `#dc2626` is the only sign of "Active" or "Inactive". It has no text, and people with color vision differences or screen readers get nothing. The raw hex values and pixel sizes also ignore the tokens and won't follow the theme or dark mode.
   Fix: Use `<Badge>` with the words "Active" and "Inactive" and a status variant, so the colors come from tokens.
   If skipped: The Status column carries no information for some people, and it looks wrong in dark mode.

3. **TeamMembers.tsx:42: `IconButton` with no `label`**
   Problem: The delete button has no accessible name or tooltip. Screen readers hear "button" for every row.
   Fix: Add `label={\`Remove ${m.name}\`}`, so each row's button is distinct.
   If skipped: Screen reader users can't tell which member a button removes.

4. **TeamMembers.tsx:19-21: failure message doesn't help and isn't next to the field**
   Problem: "Something went wrong!" is a vague message with an exclamation mark, and it appears in a toast that disappears. It doesn't say what to do. There is also no check for an empty or malformed email before `onInvite` is called, and focus doesn't move to an error.
   Fix: Validate first and pass `error="Enter an email address, like name@company.com"` to `Field`. On failure, keep the dialog open and show an `Alert` or the `Field` error: "We couldn't send the invite. Try again." Move focus to the field or the alert.
   If skipped: Someone who mistypes or hits a server error is left without guidance, and the message may vanish before it is read.

### Should fix
1. **TeamMembers.tsx:26, 50, 54: button and dialog words**
   Problem: "Invite Member" is Title Case. "OK" doesn't say what it does. The dialog title "Invite" and its button use different words.
   Fix: Use "Invite member" for the page button. Use the title "Invite member" and the button "Send invite" in the dialog, or give both the same verb. Also set `type="email"` on the `Input`.
   If skipped: The copy is inconsistent and unclear, and mobile keyboards don't offer the email layout.

2. **TeamMembers.tsx:36-44: no empty state**
   Problem: With no members the table renders with only its headers.
   Fix: When `members.length === 0`, render `EmptyState` saying where team members appear, with an "Invite member" action.
   If skipped: A new team sees an empty table with no hint of what to do.

### Nice to have
- `onRemove` deletes at once with no confirmation and no feedback. Consider a confirm `Dialog` (or `TypeToConfirm`) and `toast("Member removed")`.
- Disable the send button while `onInvite` is pending, to prevent double invites. Reset `email` when the dialog closes.

Verdict: Not ready: 4 must fix, 2 should fix.