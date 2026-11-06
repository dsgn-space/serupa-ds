### Should fix
1. **RenameProject.tsx:46: The dialog can be closed while the rename is saving, so a failure goes unseen**
   Problem: Cancel, Escape and the backdrop stay active while `saving` is true. If the person closes the dialog and `onRename` then rejects, the `catch` (line 30) sets an error in a dialog that is no longer open. The rename fails with no toast and no message, and the old name stays on the page.
   Fix: While `saving`, set `disabled={saving}` on Cancel and make `onOpenChange` ignore close requests (`onOpenChange={(o) => { if (!saving) setOpen(o); }}`). Also add `if (saving) return;` at the top of `rename` so Enter in the field can't submit twice.
   If skipped: People who dismiss the dialog during a slow or failing save think the project was renamed. A second submit can also send the request twice.

### Nice to have
1. **RenameProject.tsx:30: The server failure is shown as an error on the name field**
   Problem: "We couldn't rename the project. Try again." says nothing about the name. Putting it on `Field` marks the name as invalid, so a screen reader announces a bad value when the problem is the request.
   Fix: Keep `error` for the empty-name case. Show a request failure in an `Alert` (variant danger) above the form inside the dialog, and still move focus back to the input.

2. **RenameProject.tsx:19: A submit with the unchanged name calls `onRename` anyway**
   Problem: Pressing Rename without a change sends a request and shows "Project renamed".
   Fix: If `value.trim() === name`, close the dialog and return without calling `onRename` or `toast`.

Verdict: Not ready: 0 must fix, 1 should fix.