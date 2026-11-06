### Must fix

1. **TeamMembers.tsx: invite dialog is a hand-built `div`, not `Dialog`**
   Problem: A `fixed inset-0` div with an `onClick` backdrop has no `role="dialog"`, no accessible name, no focus trap, no Escape to close, and no focus return to the trigger. It also covers the whole page with an opaque `bg-surface`, so it isn't a modal over a dimmed page. Keyboard and screen reader users can tab behind it.
   Fix: Replace it with `Dialog` and set its title to "Invite member". Put `Field` and `Input` in the body and the actions in the footer, with a "Cancel" button and a "Send invite" button.
   If skipped: Keyboard and screen reader users can't use the invite flow. Focus gets lost behind the overlay.

2. **TeamMembers.tsx: `IconButton` has no `label`**
   Problem: The delete button has no accessible name and no tooltip, so screen readers announce an unlabeled button. Nothing says which member it removes.
   Fix: Add `label={`Remove ${m.name}`}`.
   If skipped: Screen reader users can't tell what the button does or which row it acts on.

3. **TeamMembers.tsx: status is shown by color alone**
   Problem: The Status cell is an 8px dot, green or red, with no text. Color-blind and screen reader users get no status. The dot is also under the 24px target guidance for anything meant to be read.
   Fix: Replace the span with `<Badge>` showing "Active" or "Inactive", plus a status icon if you want one. Pick the Badge color by role.
   If skipped: The status is invisible to anyone who can't tell red from green, and to screen readers.

4. **TeamMembers.tsx: removal happens with one click and no confirmation**
   Problem: `onRemove(m.id)` runs on a single click on an icon-only button. This can't be undone, and the change doesn't tell the user it happened (no toast, no `announce`).
   Fix: Confirm in a `Dialog` titled "Remove member?" with a "Remove member" button. Or use `toast` with an undo. Call `toast('Member removed')` after the removal.
   If skipped: A mis-click removes a teammate, and screen reader users aren't told it happened.

5. **TeamMembers.tsx: invite failure is a toast with no way to fix it**
   Problem: `toast('Something went wrong!')` goes away by itself. It says nothing about what to do, uses an exclamation mark, and the user's email stays in the dialog with no error near the field. An invalid email also gets no check before submit and no focus move to the error.
   Fix: Validate the email before sending. On failure, show the message next to the field with `Field`'s `error` prop and move focus to the input. For the server failure, use "We couldn't send the invite. Try again." in an `Alert` inside the dialog. Mark the input `invalid`.
   If skipped: Users lose the failure message after a few seconds, and don't know whether to retry.

### Should fix

1. **TeamMembers.tsx: raw colors and pixel sizes in the style prop**
   Problem: `#16a34a`, `#dc2626`, `width: 8`, `height: 8`, `borderRadius: 4` skip the tokens and don't follow the theme or dark mode.
   Fix: This goes away with `Badge` (Must fix 3). If you keep a custom marker, use `bg-success` or `bg-danger` and a `rounded-full` class.
   If skipped: Colors don't adapt per theme, and Stylelint or the Serupa lint rules will flag them.

2. **TeamMembers.tsx: "OK" button**
   Problem: "OK" doesn't say what the button does, and the dialog title ("Invite") uses a different word.
   Fix: Use "Send invite", and title the dialog "Invite member". Use the same verb in both.
   If skipped: The button is unclear, especially to screen reader users who hear it out of context.

3. **TeamMembers.tsx: "Invite Member" is in Title Case**
   Problem: Serupa uses sentence case everywhere.
   Fix: Use "Invite member". Likewise, make the "Actions" header "Actions" only if it's needed. Rendering it as a visible column header is fine, but a `VisuallyHidden` label is cleaner for a column with only icon buttons.
   If skipped: The page is inconsistent with the rest of the app.

4. **TeamMembers.tsx: input is not reset, and the form is not a form**
   Problem: `email` stays in state after a successful invite, so the next open shows the old address. The Input has no `type="email"`, no `autoComplete`, and Enter doesn't submit. The submit button is not inside a `<form>`.
   Fix: Wrap the fields in `<form onSubmit>`, set `type="email"` and `autoComplete="off"`, and call `setEmail('')` after success. Disable the button or show a loading state while the request runs, so a double click can't send two invites.
   If skipped: Users see stale data, can't submit with Enter, and can send duplicate invites.

5. **TeamMembers.tsx: `<h2>Invite</h2>`, a bare heading**
   Problem: A raw `h2` skips Serupa's type styles. It goes away with `Dialog`, but if you keep any heading, use the component.
   Fix: Use `Dialog`'s title prop, or `Heading level={2}`.
   If skipped: The type styling differs from the rest of the app.

### Nice to have

1. **TeamMembers.tsx: empty state**
   When `members` is empty, the table renders only a header. Add an `EmptyState` saying what goes here, with an "Invite member" action.

2. **TeamMembers.tsx: use `Badge` for status and `Stack` for the button row**
   The page would read better with the invite button placed in a toolbar row beside a heading. The Stack as written is fine.

Verdict: Not ready: 5 must fix, 5 should fix.