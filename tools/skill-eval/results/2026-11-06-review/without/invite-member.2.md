# Review: `TeamMembers`

I couldn't check serupa-ds from here, so the component names and props below are inferred from your code. Wherever I say the DS "likely" has something, check that before acting on it.

## Must fix

1. **The hand-rolled modal isn't accessible.**
   - It's a plain `div` with no `role="dialog"`, `aria-modal` or `aria-labelledby`.
   - Focus doesn't move into it on open, isn't trapped, and isn't restored to the "Invite Member" button on close.
   - Escape does nothing.
   - The page behind it stays scrollable and reachable by Tab.
   - There's no `z-index`, so it may render under sticky headers.
   - If serupa-ds has a `Dialog` or `Modal` (it likely does), use that and delete this block. It would also drop the `fixed inset-0 bg-surface` classes. That is an opaque full-screen page rather than a dialog, and `bg-surface` may not be a valid token.

2. **Status is shown by color only.**
   - The 8px dot has no text or accessible name, so screen readers get nothing.
   - Red and green are indistinguishable for many color-blind users (WCAG 1.4.1).
   - Hardcoded hex values (`#16a34a`, `#dc2626`) bypass the design tokens and won't follow theming or dark mode.
   - Use a DS `Badge`, `Tag` or `StatusDot` with a visible "Active" / "Inactive" label.

3. **`IconButton` has no accessible label.**
   - Add one that names the member, for example `aria-label={`Remove ${m.name}`}`, so the buttons are distinguishable. Check whether the DS prop is `label` or `aria-label`.
   - The remove action is destructive and fires immediately, with no confirmation or undo.
   - `onRemove` is synchronous with no pending or error feedback.
   - Add a confirm step (or an undo toast) and let `onRemove` return a promise.

4. **The invite form is missing basics.**
   - It isn't a `<form>`, so Enter doesn't submit.
   - There's no email validation, no `type="email"`, and no trimming.
   - There's no in-flight state, so double-clicking OK sends duplicate invites.
   - `email` is never reset, so reopening the dialog shows the previous address.
   - There's no Cancel button.
   - Clicking the backdrop closes the dialog and silently discards the input. Drop that behavior for a form dialog.

## Should fix

5. **Error handling is weak.**
   - `catch {}` drops the error. The user sees only "Something went wrong!", which says nothing and doesn't offer a retry.
   - Show a specific message inline on the `Field` (for example "That person is already on the team"), and keep the dialog open, which it already does.
   - Toasts vanish and aren't tied to the input.

6. **Copy.**
   - "OK" should be a specific verb, such as "Send invite".
   - "Invite" as the heading should be "Invite team member".
   - "Invite Member" should be sentence case to match the other copy, so "Invite member".
   - "Invite sent" could include the address: "Invite sent to a@b.com".

7. **Missing states.**
   - There's no empty state when `members` is empty.
   - Nothing shows pending (invited, not yet joined) members, so a successful invite leaves no visible trace in the table.
   - Check how the table behaves at narrow widths. Four columns may overflow on mobile.

## Minor

- Replace the raw `<h2>` with the DS heading or typography component.
- Add `autoComplete` and a placeholder or `aria-describedby` hint on the email input.
- Use `Member['id']` and type the callbacks as `Promise<void> | void`.
- Consider splitting the invite dialog into its own component. It would own the `email`, `open` and pending state, and the table would stay presentational.

## Verdict

Request changes. The items under "Must fix" are accessibility and data-loss risks, and most of them go away if you use the DS dialog and badge components.