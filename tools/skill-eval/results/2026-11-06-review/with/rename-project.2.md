### Nice to have
1. **RenameProject.tsx:30: a failed save is shown as a field error**
   Problem: "We couldn't rename the project. Try again." is about the request, not the name. As a field error it makes the input look invalid, and it won't read as a save failure.
   Fix: Keep the empty-name check as the `Field` error. Show a save failure in an `Alert` (`variant="danger"`) at the top of the form, or at least keep it separate from the field's error state.
   If skipped: This works, because the message is next to the field and focus moves there. People may still think the name was the problem when the network was.

2. **RenameProject.tsx:46: Cancel stays active while the rename is saving**
   Problem: During `saving`, Cancel, Escape or a click outside can close the dialog. The rename may still finish, and the toast appears with no dialog open.
   Fix: Add `disabled={saving}` to Cancel. Guard `onOpenChange` so it ignores close requests while `saving` is true.
   If skipped: This is a small edge case. Someone could close the dialog, not know whether the rename went through, and wait for the toast to find out.

Verdict: Ready to merge.