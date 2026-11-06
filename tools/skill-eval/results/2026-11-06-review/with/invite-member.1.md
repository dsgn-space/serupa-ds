### Must fix

1. **TeamMembers.tsx, the `{open && (<div className="fixed inset-0 …">` block: the invite dialog is built by hand**
   Problem: The overlay is a `div` with an `onClick` and no `role="dialog"`, no accessible name, no focus trap, no Escape to close, and no focus return to the trigger. Keyboard and screen reader users can tab behind it into the page, and the heading is a bare `<h2>`. The `bg-surface` fill also hides the page instead of dimming it.
   Fix: Use `Dialog` with `open={open}`, an `onClose` that sets it to false, and the title "Invite member". Put the Field and the buttons inside it. Add a "Cancel" button next to the primary one.
   If skipped: Keyboard users get lost behind the overlay, and screen readers don't announce it as a dialog.

2. **TeamMembers.tsx, the Status cell: color alone carries meaning**
   Problem: The status is an 8px dot, green or red, with no text. Screen readers get nothing, and people with color blindness can't tell active from inactive. The column header says "Status" but the cell has no content.
   Fix: Replace the `span` with `<Badge>` using the text "Active" or "Inactive". Pick the variant by role (`success` or `danger`).
   If skipped: Status is invisible to screen reader users and unreliable for color-blind users.

3. **TeamMembers.tsx, the delete `IconButton`: no `label`**
   Problem: The button has no accessible name or tooltip, so screen readers announce an unnamed button. Every row has the same one, so people can't tell which member it removes.
   Fix: Add `label={`Remove ${m.name}`}`. Removing a member can't be undone from here, so also confirm it (a Dialog titled "Remove member?" with a "Remove" button), or at least tell people with `toast`.
   If skipped: Screen reader users can't find out what the button does or who it removes.

4. **TeamMembers.tsx, `invite()` catch branch: the error doesn't help and disappears**
   Problem: The toast "Something went wrong!" gives no next step and has an exclamation mark. A toast also vanishes on its own, so an invite that failed leaves no trace. The Input has no `invalid` state and no error next to the field.
   Fix: Show an error next to the field instead: `<Field label="Email" error="We couldn't send the invite. Check the address and try again.">` with `invalid` on the `Input`. Keep `toast('Invite sent')` for success only. Move focus to the field after a failure.
   If skipped: People don't know the invite failed or what to do about it.

5. **TeamMembers.tsx, the invite `Input`: no validation, no `type`, no reset**
   Problem: Empty or malformed input goes straight to `onInvite`. `type="email"`, `autoComplete="email"` and a "Enter an email address" error are missing. The `email` state is also never cleared after a successful send, so the next dialog opens with the old address.
   Fix: Validate before calling `onInvite`, with an error like "Enter an email address, like name@company.com". Add `type="email"`, wrap the controls in a `<form onSubmit>` so Enter submits, and call `setEmail('')` on success.
   If skipped: People can submit blank addresses, and a stale address shows on the next open.

### Should fix

6. **TeamMembers.tsx, the Status cell `style`: raw values**
   Problem: `#16a34a`, `#dc2626`, `width: 8`, `height: 8` and `borderRadius: 4` are raw colors and pixel sizes. They don't follow the theme or dark mode.
   Fix: This goes away with the `Badge` from finding 2. If a dot stays, use `bg-success` / `bg-danger` and `rounded-full` with token sizes.
   If skipped: The colors stay the same in every theme and may fail contrast in dark mode.

7. **TeamMembers.tsx, the invite `Button` text "OK"**
   Problem: "OK" doesn't say what the button does, and the dialog title ("Invite") and the button must use the same verb.
   Fix: Title the dialog "Invite member" and label the button "Send invite".
   If skipped: People can't tell what the button will do.

8. **TeamMembers.tsx, the "Invite Member" `Button` and the "Actions" column header: casing**
   Problem: "Invite Member" is in Title Case, and the content style wants sentence case. The "Actions" header is a column of icon buttons with no visible content for sighted users either.
   Fix: Use "Invite member". Keep "Actions" as a header, but make it visually hidden with `<VisuallyHidden>` if you want a quieter table.
   If skipped: Copy drifts from the rest of the app.

9. **TeamMembers.tsx, `onRemove` and `onInvite` feedback**
   Problem: Removing a member gives no feedback, neither a toast nor an announcement. The button is also not disabled while `onInvite` runs, so a double click sends two invites.
   Fix: Call `toast('Member removed')` after removal. Track a `sending` state and set `disabled` or `loading` on the "Send invite" button.
   If skipped: People are unsure whether the removal worked, and duplicate invites can go out.

10. **TeamMembers.tsx, the empty `members` array**
    Problem: With no members, the table is just a header row.
    Fix: Show an `EmptyState` that says "No team members yet" and offers "Invite member".
    If skipped: The page looks broken for a new team.

### Nice to have

- `Stack gap={4}` puts the invite button above the table at full width. Consider placing it at the end of a row with a `Heading`.
- The component is a page section, so confirm the settings page that renders it has one `h1`, a `main`, and a skip link. The change doesn't show that.

Verdict: Not ready: 5 must fix, 5 should fix.