# Review: `TeamMembers`

I couldn't inspect `serupa-ds` in this session, so I haven't checked its component names or props. Where I suggest a DS component, confirm that it exists.

## Blocking

**1. The invite dialog is hand-rolled and inaccessible.**
- It is a `div` with `fixed inset-0 bg-surface`. It has no `role="dialog"`, no `aria-modal` and no `aria-labelledby`.
- There is no focus trap and focus doesn't move into the dialog on open. It isn't restored to "Invite Member" on close, and Escape doesn't close it.
- Background content stays reachable by keyboard and screen reader.
- It is a full-screen opaque panel, not a dialog, and it has no scrim or width constraint.
- It also ignores the DS's z-index and layering. `fixed inset-0` without a z-index may render under other content.
- Use the DS `Dialog` or `Modal` if one exists, or the native `<dialog>` with `showModal()`. That gives you focus management, Escape and inertness for free.
- Clicking the backdrop closes the dialog and discards the typed email. Use an explicit Cancel button instead.

**2. The status indicator is colour only.**
- A green or red 8px dot has no text alternative, which fails WCAG 1.4.1 (use of colour) and 1.1.1. Red/green is also the worst pair for colour-blind users.
- Use the DS `Badge` or `Tag` with a text label ("Active" / "Inactive"), or at minimum add visible text and an icon.
- The inline `style` with hard-coded hex values (`#16a34a`, `#dc2626`) bypasses the DS tokens, so it breaks theming and dark mode. The file also mixes inline styles with Tailwind classes.
- "Inactive" shown in red reads as an error. It may mean "pending" or "deactivated", so check the semantics.

**3. The delete `IconButton` has no accessible name.**
- It is an icon-only button with no `aria-label`, so screen readers just announce "button". Add `aria-label={`Remove ${m.name}`}`, or whatever prop the DS uses for this.
- `onRemove(m.id)` fires immediately with no confirmation. Removing a team member is destructive. Add a confirm step or an undo toast.
- There is no pending or disabled state, and no error handling. `onRemove` returns `void`, so failures are invisible. Consider `Promise<void>`, to match `onInvite`.

## Should fix

**4. `invite()` has several problems.**
- The email isn't validated and not even trimmed. An empty string goes straight to `onInvite`. Use `type="email"`, `required`, and a disabled state or inline error.
- There is no in-flight state. The user can double-click "OK" and send duplicate invites. Track `submitting` and disable the button while it is true.
- The `catch` swallows the error and shows "Something went wrong!". That isn't actionable, because it doesn't say what failed or what to do. Surface the reason where it's safe to, for example "Already a member" or "Invalid email". The exclamation mark is also off-tone for an error.
- On success, `email` isn't reset, so reopening the dialog shows the previous address. On failure, the dialog stays open, which is correct.
- Wrap the form in `<form onSubmit>` so Enter submits. Right now it doesn't.
- If the toast is a live region, fine. If not, announce results to assistive tech.

**5. The form fields are missing attributes.**
- Add `type="email"`, `autoComplete="off"` or `"email"` as appropriate, `inputMode="email"`, and `name`.
- Autofocus the input when the dialog opens, if the DS dialog doesn't do this already.
- The dialog `<h2>` is a raw element. Use the DS heading or typography component, and keep the heading level consistent with the page.

**6. Copy is inconsistent and unclear.**
- Use "Send invite" as the primary action label instead of "OK", and add a "Cancel" button. The trigger should be "Invite member" (sentence case), if that's the DS convention. "Invite" as a title is also vague, so use "Invite a team member".
- "Actions" as a column header is fine, but the cell content needs labels (see 3).

## Minor

- **Empty state:** with `members = []`, the table renders headers only. Add an empty state with a prompt to invite.
- **Table semantics:** confirm that `caption` renders a visible or visually-hidden `<caption>`. Confirm that `TableHeaderCell` sets `scope="col"`.
- **Types:** `Member` and the props aren't exported, so consumers can't reuse them. `active: boolean` can't represent "pending invite", which is likely the next requirement. Consider `status: 'active' | 'pending' | 'inactive'`.
- **Stale imports:** `import * as React` is only needed for `React.useState`. If the project uses the automatic JSX runtime, use `import { useState } from 'react'`.
- **Tests:** none are included. At minimum, test the successful invite, the failed invite (dialog stays open and an error shows), the empty-email case, and removal.
- **Layout:** `Stack gap={4}` puts the Invite button above the table at full stack width. That's probably fine, but check against the page's header-action pattern. Settings pages usually place it top-right.

## Summary

The structure is clean and the data flow is simple. Don't merge until three things are fixed: the custom modal, the colour-only status, and the unlabeled destructive icon button. The invite flow also needs validation, a submitting state, and a clearer error message. Most of this should collapse into DS components (`Dialog`, `Badge`, and a labelled `IconButton`) with less custom code.