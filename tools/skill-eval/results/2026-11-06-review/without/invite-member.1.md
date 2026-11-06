# Review: `TeamMembers`

The table is fine. The invite dialog and the status/delete cells have real problems. I couldn't check serupa-ds's API, so where I say "use the DS component", confirm the exact name in the docs.

## Blocking

1. **The dialog is hand-rolled instead of using the DS dialog/modal.**
   - It has no `role="dialog"`, `aria-modal` or `aria-labelledby`.
   - It has no focus trap, no focus move into the dialog on open, no focus return to "Invite Member" on close, and no Escape to close.
   - Page scroll isn't locked, and there's no z-index. `fixed inset-0 bg-surface` is also a full-screen opaque panel, not a scrim plus a card. Raw Tailwind classes may not even be available in a DS-based project.
   - Fix: use the DS `Dialog`/`Modal` with its title, footer actions and focus handling. If the DS has none, raise that with the DS team instead of building it here.

2. **The delete `IconButton` has no accessible name.**
   - A screen reader hears "button". Add `aria-label={`Remove ${m.name}`}` (or the DS equivalent prop) so each button identifies its row.
   - Removal is destructive and fires immediately, with no confirmation or undo. At minimum, confirm in a dialog or use an undo toast.
   - `onRemove` has no failure handling or pending state.

3. **Status is shown by color alone.**
   - The 8px dot is red or green with no text, tooltip or `aria-label`. That fails WCAG 1.4.1 (use of color), and red/green is the worst pair for color-blind users. Screen readers see an empty cell.
   - It also hardcodes hex values and inline styles instead of DS tokens.
   - Fix: use the DS `Badge`/`Tag`/`Status` with a text label ("Active" / "Inactive"). If you keep a dot, add visible text next to it.

## Should fix

4. **The invite flow has no loading or double-submit protection.** `invite()` can be fired repeatedly while `onInvite` is pending, which sends duplicate invites. Disable the button and show a loading state while it's pending.

5. **There is no email validation, and the field isn't a form.**
   - `Input` has no `type="email"`, `autoComplete`, trim or validation. Empty or garbage input goes straight to `onInvite`.
   - Wrap the dialog contents in a `<form onSubmit>` so Enter submits. The OK button should be `type="submit"`.
   - Use the Field's error state for validation messages.

6. **Errors are generic and out of context.**
   - The `catch` discards the error and shows "Something went wrong!" in a toast, while the dialog stays open behind it. Show the error inline in the dialog. Say what failed ("Couldn't send invite. Check the address and try again."), and surface specifics such as "already a member".
   - Toasts also vanish. Don't use them as the only channel for an error the user has to act on.

7. **State leaks between openings.** After a successful invite, `email` isn't cleared, so reopening the dialog shows the previous address. Reset on close.

8. **There is no way to cancel except clicking the backdrop.**
   - Add an explicit Cancel/close button.
   - Backdrop click silently discards typed input. For a form, don't close on backdrop click, or only close when the field is empty.

## Copy

9. **Wording is vague and inconsistent.**
   - "OK" should be "Send invite".
   - The heading "Invite" should be "Invite team member".
   - "Invite Member" should be "Invite member" if the DS uses sentence case.
   - "Something went wrong!" (see 6).
   - The "Actions" column header is fine visually, but screen readers get little from it.

## Minor

- There is no empty state when `members` is empty. Show a message and an invite prompt, not just headers.
- `active: boolean` can't represent "invited/pending", which a member table with invites will need. Consider a `status` union now.
- The dialog should be its own component (`InviteMemberDialog`) with `open`/`onClose`/`onSubmit` props. That would make `TeamMembers` simpler and the dialog testable.
- `onRemove` is sync while `onInvite` is async. Make the two APIs consistent (`Promise<void>`) so failures can be handled.
- `setOpen(false)` and `toast` run after an `await`. If the component unmounts mid-request, that's harmless in React 18, but the pending state from item 4 should still be guarded.
- No tests are included. At least cover invite success, invite failure, and the dialog's keyboard behavior.

**Verdict:** request changes. Items 1–3 are accessibility and DS-compliance blockers. Items 4–8 are the correctness and UX gaps users will hit first.