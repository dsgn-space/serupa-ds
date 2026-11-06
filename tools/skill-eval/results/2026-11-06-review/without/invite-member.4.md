# Review: `TeamMembers`

I couldn't open the repo, so I haven't checked any serupa-ds component names or props. Where a finding depends on the design system's API, I say so.

## Blocking

**1. The invite dialog is hand-rolled and inaccessible.**
- It is a `<div className="fixed inset-0 bg-surface">` with no `role="dialog"`, no `aria-modal` and no accessible name. The `<h2>` isn't linked to it with `aria-labelledby`.
- There is no focus trap and focus isn't moved into the dialog on open. It isn't returned to "Invite Member" on close, so keyboard and screen-reader users can tab into the page behind it.
- There is no Escape-to-close handler.
- It renders inline in the component tree, not through a portal. Any ancestor with `transform`, `overflow` or a stacking context can clip it or break `fixed`.
- It has no z-index and no scroll lock.
- It is a full-screen opaque surface, not a centered dialog over a scrim, so it reads as a page takeover.
- Use serupa-ds's Dialog/Modal if it has one. If it doesn't, flag that as a missing component instead of building a one-off.

**2. Clicking the backdrop discards typed input.** `onClick={() => setOpen(false)}` on a full-screen overlay means a stray click closes the dialog. It also leaves `email` in state, so the stale value shows up next time. Reset `email` on close and on success.

**3. Status is shown by color alone.** The Status cell is an 8px dot, green or red, with no text and no accessible name. This fails WCAG 1.4.1 (use of color) and is invisible to screen readers. It is also hard to read for red/green color blindness. Replace it with the design system's Badge/Tag/StatusIndicator showing "Active"/"Inactive" text. The hardcoded `#16a34a`/`#dc2626` and inline `style` should become design tokens. Hardcoded colors won't follow dark mode or theming.

**4. The destructive action is unlabeled and unconfirmed.**
- `<IconButton icon="delete" />` has no `aria-label`/`label`, so every row announces as an unnamed button. It should say something like `Remove ${m.name}`.
- Removal fires immediately with no confirmation and no undo. Removing a team member is destructive, so it needs a confirm dialog or an undo toast.
- `onRemove` returns `void`, so failures and in-flight state can't be shown. Make it async like `onInvite` and handle errors.

## Should fix

**5. The form has no semantics, validation or loading state.**
- The Input and Button aren't in a `<form>`, so Enter doesn't submit.
- The email input has no `type="email"`, `autoComplete`, `required` or `autoFocus`.
- There is no validation. An empty or malformed email goes straight to `onInvite`.
- There is no pending state. The button isn't disabled during the request, so double-clicking sends duplicate invites. Add `submitting` state and disable or show a loading state.
- There is no inline error. Field errors belong on the `Field` (if it supports an error prop), not only in a toast.

**6. The error handling swallows information.**
- `catch {}` discards the error. The toast "Something went wrong!" is vague and gives no next step (for example "Couldn't send invite to x@y.com. Try again."). Surface the server's message when it's useful, such as "already a member" or "invalid email".
- The toast is the only error feedback and is transient. The dialog stays open, which is right, but the user is left with no persistent error state.
- It's unclear whether serupa-ds `toast` supports variants. If it does, use success/error variants.

**7. The copy is inconsistent and weak.**
- "Invite Member" uses title case, while "Invite sent" uses sentence case. Pick one convention.
- "OK" is a poor button label. Use "Send invite".
- The `<h2>Invite</h2>` heading should say "Invite team member".
- There is no Cancel button or close affordance.
- "Something went wrong!" has an exclamation mark on an error, which reads as alarming.

**8. There is no empty state.** When `members` is empty the table renders headers and nothing else. Add an empty-state message with a prompt to invite someone.

## Minor

- The header says "Actions", but the column holds a single destructive icon. Keep it, but make sure the header is visually hidden or labeled consistently with how serupa-ds handles action columns.
- `import * as React` is fine, but check whether the project convention uses named imports or the new JSX transform.
- Raw `<div>` and `<h2>` bypass the DS layout and typography components (Stack is used elsewhere, but not here). If serupa-ds has Heading/Text, use them.
- The `active` boolean is a thin model for a team-members table. If invited-but-pending is a real state, you'll want a status enum. Consider it now, since this feature creates pending invites.
- Extract the dialog into its own `InviteMemberDialog` component. It would hold the `email`, `submitting` and `error` state and keep `TeamMembers` presentational.
- There are no tests. At minimum, cover invite success, invite failure (dialog stays open, error shown) and double-submit prevention.

## Summary

The table structure is fine. The invite dialog and the status/remove controls need rework before merge. In priority order, I'd do these:
1. Replace the custom overlay with the DS dialog, wrapped in a `<form>`.
2. Replace the color dot with a text Badge.
3. Label the delete button and add a confirmation.
4. Add a submitting state and email validation.
5. Reset the form state on close.