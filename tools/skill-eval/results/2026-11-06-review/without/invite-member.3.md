# Review: `TeamMembers`

I couldn't check the serupa-ds API from here. Where I name a DS component, such as `Dialog`, `Badge` or `Tag`, confirm it exists and use its real name.

## Blockers

1. **The hand-rolled modal isn't accessible and probably duplicates a DS component.**
   - It has no `role="dialog"`, `aria-modal`, or `aria-labelledby` on the `<h2>`.
   - It has no focus trap, no Escape-to-close, no initial focus on the input, and no focus return to "Invite Member" on close. Keyboard and screen-reader users can tab out into the page behind it.
   - `fixed inset-0 bg-surface` makes an opaque full-screen page. It isn't a centered dialog over a scrim, and it has no `z-index`, so it can render under other fixed UI.
   - Raw Tailwind classes and a bare `<h2>` bypass the DS.
   - Use the DS `Dialog`/`Modal`. If none exists, the native `<dialog>` with `showModal()` gives you most of this for free.

2. **Status is conveyed by color alone.**
   - The red/green dot has no text and no accessible name. It fails WCAG 1.4.1 and is unreadable for color-blind and screen-reader users.
   - The hex values `#16a34a` and `#dc2626` and the inline style bypass the design tokens, so they won't follow dark mode or theming.
   - Use a DS `Badge`/`Tag`/`StatusIndicator` with a visible "Active" or "Inactive" label.
   - Also check whether red is right for "inactive". It reads as an error state.

3. **The delete `IconButton` has no accessible label.** Screen readers will announce just "button". Add `aria-label={`Remove ${m.name}`}`, or whatever label prop the DS uses, so each row is distinguishable.

4. **Removal is destructive, immediate, and has no feedback.** There is no confirmation, no undo, and no success or failure toast. `onRemove` is typed as synchronous, unlike `onInvite`, so a failed removal can't be reported. Add a confirm step and make it `Promise<void>` with the same handling as invite.

## Should fix

5. **The invite form is incomplete.**
   - It isn't a `<form>`, so Enter doesn't submit it.
   - The input needs `type="email"`, `autoComplete="off"` or a suitable value, and `required`. There is no validation. Trim the value before sending.
   - There is no pending state, so a double click sends two invites. Disable the button and show a loading state while the request runs.
   - There is no Cancel button. The only ways out are the backdrop click or the OK button, which sends an invite.
   - The backdrop click discards typed input without warning.
   - `email` isn't reset after a successful invite, so reopening shows the old address.

6. **Error handling hides the cause.**
   - `catch {}` swallows the error, and "Something went wrong!" tells the user nothing they can act on.
   - It's also an unactionable toast for a form error. Show the error inline on the field, such as "That email is already on the team", and keep the dialog open, which it already does.
   - Use the error variant of `toast` if the DS has one. Both outcomes currently look identical.

7. **Copy is vague or inconsistent.**
   - "OK" should be "Send invite".
   - The heading "Invite" should be "Invite a team member".
   - "Invite Member" uses Title Case, while "Invite sent" uses sentence case. Pick one, and sentence case is the usual choice.
   - "Invite sent" could say who it went to.

8. **There is no empty state.** With `members=[]` the user sees only headers. Add a row or message like "No team members yet".

## Nits

- The `Actions` header is visible text over an icon-only column. A visually hidden label is enough.
- Check that `Stack gap={4}` is on the DS spacing scale and that `caption` renders what you want (visible or hidden).
- The component takes four props from the parent. Consider whether `open` and `email` belong in a small `InviteDialog` component, which would also make the dialog testable on its own.
- There are no tests. At minimum cover invite success, invite failure, and the remove callback.

## Summary

Request changes. The logic is simple and correct on the happy path. The blockers are accessibility (modal, status dot, unlabeled icon button) and DS compliance (custom modal, hard-coded colors).