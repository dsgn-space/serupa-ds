### Must fix

1. **TeamMembers.tsx, the `{open && (<div className="fixed inset-0 …">` block: hand-built dialog**
   Problem: A `div` with an overlay click handler stands in for a modal. It has no `role="dialog"`, no accessible name, no focus trap, no Escape to close, no focus return to the trigger, and no inert page behind it. Keyboard and screen reader users can tab out to the page underneath. `bg-surface` makes it a full-screen opaque page, not a dimmed overlay.
   Fix: Use `Dialog` with the title "Invite member" and a "Send invite" button. Put `Field` and `Input` inside it, and close it with the Dialog's own `onOpenChange`/close handling.
   If skipped: Keyboard and screen reader users get lost behind the overlay and can't dismiss it with Escape.

2. **TeamMembers.tsx, `<IconButton icon="delete" onClick=… />`: no `label`**
   Problem: The button has no accessible name. Screen readers say "button", and sighted mouse users get no tooltip. Every row looks the same.
   Fix: Add `label={`Remove ${m.name}`}` so each row's button is distinct.
   If skipped: Screen reader users can't tell what the button does or which member it removes.

3. **TeamMembers.tsx, the status cell (`<span style={{ … background: m.active ? '#16a34a' : '#dc2626' }} />`): color alone carries meaning**
   Problem: Active and inactive differ only by a green or red dot, with no text. The dot is invisible to screen readers and to people who can't tell red from green.
   Fix: Replace it with `<Badge>` showing the words "Active" or "Inactive" (use the matching status variant for color as a second cue).
   If skipped: Colour-blind and screen reader users can't see who is active.

4. **TeamMembers.tsx, `<Input value={email} … />`: email field has no type and no error handling**
   Problem: The field is a plain text input. It has no `type="email"`, no `autoComplete`, and no validation. The `catch` shows no error beside the field. Submitting an empty or invalid address sends it straight to `onInvite`. Focus doesn't move to an error.
   Fix: Set `type="email"` and `autoComplete="off"`. Check the address before submitting and show "Enter an email address like name@company.com" through `Field`'s error with `invalid` on the Input, then focus the Input. Show a failed invite as an error in the dialog (see Should fix 2).
   If skipped: People who mistype get no guidance and no focus move.

### Should fix

1. **TeamMembers.tsx, `<span style={{ … width: 8, height: 8, borderRadius: 4, background: '#16a34a' … }} />`: raw values**
   Problem: Hex colors and pixel sizes are written inline. They ignore themes, so the dot doesn't adapt to dark mode or the brand.
   Fix: Remove the span (Must fix 3). If a dot is still wanted, use `bg-success` / `bg-danger` with `rounded-full` and `size-2`.
   If skipped: Colors stay fixed in every theme and drift from the design system.

2. **TeamMembers.tsx, `catch { toast('Something went wrong!'); }`: wrong feedback and wrong words**
   Problem: A failure that needs action is shown in a toast that disappears. The text is the vague "Something went wrong" with an exclamation mark, and it says nothing about what to do. The `<Table>` and dialog are also left without any live status.
   Fix: Keep the dialog open and show an `Alert` (error variant) inside it: "We couldn't send the invite. Check the email address and try again." Keep `toast('Invite sent')` for success.
   If skipped: The error disappears before people read it, and they don't know what to do.

3. **TeamMembers.tsx, `<Button onClick={invite}>OK</Button>` and `<h2>Invite</h2>`: words**
   Problem: "OK" doesn't start with a verb. The dialog title "Invite" doesn't share a verb with its button. "Invite Member" on the trigger is in Title Case.
   Fix: Trigger: "Invite member". Dialog title: "Invite a member". Confirm button: "Send invite".
   If skipped: Labels are unclear and break the sentence-case rule.

4. **TeamMembers.tsx, `<Button onClick={invite}>`: no form submit and no pending state**
   Problem: Enter in the field doesn't submit, because there is no `<form>`. The button can be pressed again while `onInvite` is still running, which can send duplicate invites.
   Fix: Wrap the Field and button in a `<form onSubmit>` with a submit button, and track a `sending` state that disables the button (or use the Button's loading prop if it has one).
   If skipped: Double clicks send duplicate invites, and Enter does nothing.

5. **TeamMembers.tsx, `<h2>Invite</h2>`: raw heading**
   Problem: A raw `h2` is used where `Heading` exists. This goes away if Dialog is used (Must fix 1), which supplies its own title.
   Fix: Use the Dialog's title, or `<Heading level={2}>`.
   If skipped: The heading style can drift from the system's type.

6. **TeamMembers.tsx, `onRemove(m.id)` on a bare IconButton: no confirmation for a destructive action**
   Problem: One click removes a member with no confirmation and no feedback.
   Fix: Confirm in a `Dialog` titled "Remove member?" with a "Remove member" button, then `toast('Member removed')`.
   If skipped: A misclick removes someone with no way back.

### Nice to have

1. **TeamMembers.tsx, the table**: A member list has no empty state. When `members` is empty, show an `EmptyState` saying where members appear, with an "Invite member" action.
2. **TeamMembers.tsx, the "Actions" header**: A column holding only an icon button can use `<VisuallyHidden>Actions</VisuallyHidden>` in the header cell so the visible header stays clean.

Verdict: Not ready: 4 must fix, 6 should fix.