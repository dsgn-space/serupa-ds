### Nice to have
1. **RenameProject.tsx:28: the save-failure message is shown as a field error**
   Problem: "We couldn't rename the project. Try again." is about the request, not the name. As a `Field` error it marks the input invalid, and a screen reader reads it as a problem with the name.
   Fix: Keep `error` for the empty-name check. Show a failed save in an `Alert` (`variant="danger"` or the equivalent) at the top of the form, and move focus to the input or the alert.
   If skipped: Nothing breaks. The message is next to the field and says what to do, but it blames the wrong thing.

2. **RenameProject.tsx:44, 51: the dialog can be closed or resubmitted while saving**
   Problem: Cancel and Escape stay active during the request. If the person closes the dialog mid-save, `setOpen(false)` and `toast('Project renamed')` still run later, and a failure sets an error nobody sees. Pressing Enter in the input may also submit a second time, depending on how `loading` blocks the button.
   Fix: Add `if (saving) return;` at the top of `rename`. Disable Cancel with `disabled={saving}`, or ignore `onOpenChange(false)` while `saving`.
   If skipped: Rarely, a rename is sent twice, or a failure is lost after the dialog closes.

Checked and fine:
- The control is wrapped in `Field` with a label.
- The error is next to the field and says what to do, and focus moves to the input on error.
- Success uses `toast`.
- The dialog title and the button use the same verb ("Rename"), in sentence case.
- The code uses Serupa components and layout only, with no raw values.
- I couldn't confirm the app renders one `<Toaster />` at its root, because that file isn't in this change.

Verdict: Ready to merge.