### Must fix

1. **TeamMembers.tsx: hand-built modal (the `{open && <div className="fixed inset-0 …">}` block)**
   Problem: A `div` posing as a dialog has no `role="dialog"`, no accessible name, no focus trap and no focus move on open or return on close. It has no Escape key handling. It is opaque (`bg-surface`), so it covers the page rather than dimming it. A click on the backdrop closes it and drops the typed email.
   Fix: Replace it with Serupa's `Dialog`, with the title "Invite member" and the Invite button inside it.
   If skipped: Keyboard and screen reader users can tab behind the overlay, can't close it with Escape, and aren't told a dialog opened.

2. **TeamMembers.tsx: `<IconButton icon="delete" …>`**
   Problem: It has no `label`, so the button has no accessible name or tooltip. Every row has the same unnamed button.
   Fix: Add `label={`Remove ${m.name}`}`. Removing a person can't be undone, so also confirm it (a `Dialog` with a "Remove" button).
   If skipped: Screen reader users hear "button" and can't tell whose row it is. A mis-click removes a member at once.

3. **TeamMembers.tsx: Status cell (the `<span style={{ … background: m.active ? '#16a34a' : '#dc2626' }} />`)**
   Problem: Status is shown by a green or red dot alone, with no text. Color-blind and screen reader users get nothing. It also uses raw hex and pixel values.
   Fix: Use `<Badge>` with the words "Active" or "Inactive". For example, `<Badge tone={m.active ? 'success' : 'neutral'}>`. Check the Badge README for its exact prop names. Don't use red for "Inactive", since it isn't an error.
   If skipped: The status can't be read without seeing color.

4. **TeamMembers.tsx: invite form (`Field` with `Input`)**
   Problem: There's no error handling next to the field and no focus move on failure. The only failure feedback is a toast, which disappears. Input has no `type="email"`, and nothing stops an empty submit. Pressing Enter doesn't submit, because there's no `<form>`.
   Fix: Wrap the fields in a `<form onSubmit>`. Use `type="email"` with `autoComplete="email"`. On failure, set the Field's `error` (for example "Enter an email like name@company.com") and focus the input, or show an `ErrorSummary`.
   If skipped: People who miss the toast don't know the invite failed or what to fix.

### Should fix

5. **TeamMembers.tsx: `toast('Something went wrong!')`**
   Problem: This is a vague message with an exclamation mark. A failure that needs action also shouldn't be a toast, which vanishes.
   Fix: Put an inline error in the dialog that says what to do, such as "We couldn't send the invite. Try again." Keep `toast('Invite sent')`, which is right for success.
   If skipped: The error disappears before it's read, and the wording breaks the voice rules.

6. **TeamMembers.tsx: `<Button onClick={invite}>OK</Button>`**
   Problem: "OK" doesn't start with a verb. The dialog title "Invite" and the page button "Invite Member" use different words and Title Case.
   Fix: Use "Send invite" for the dialog's button, "Invite member" (sentence case) for the page button and "Invite member" for the dialog title. The page and dialog verbs should match.
   If skipped: The labels are unclear and break the content rules.

7. **TeamMembers.tsx: `<h2>Invite</h2>`**
   Problem: This is a raw heading outside Serupa's type, in a hand-built dialog.
   Fix: Use the `Dialog` title. Elsewhere, use `Heading level={2}`.
   If skipped: The styles can drift, and the dialog has no name.

8. **TeamMembers.tsx: `className="fixed inset-0 bg-surface p-4"`**
   Problem: This is a hand-built overlay with no z-index or scrim tokens, and no backdrop.
   Fix: Dropped by the move to `Dialog` (finding 1).
   If skipped: The overlay may sit under sticky headers.

9. **TeamMembers.tsx: `invite()`**
   Problem: `Button` has no pending state during the async call, so double clicks send two invites. The email isn't cleared after success, so the next open shows the old address.
   Fix: Add a `submitting` state and pass `loading` and `disabled` to the Button, if it has them. Call `setEmail('')` after success.
   If skipped: Duplicate invites go out and stale values show.

10. **TeamMembers.tsx: "Actions" header cell**
    Problem: The column header is a plain word over an icon-only column.
    Fix: Keep it, or wrap it in `VisuallyHidden`.
    If skipped: Low impact.

### Nice to have

- Add an `EmptyState` for when `members` is empty. For example, "No team members yet" with an "Invite member" action.
- `onRemove` could show `toast('Member removed')` and an undo.
- The `Table` can stay as it is. Its `caption` is good.

Verdict: Not ready: 4 must fix, 6 should fix.