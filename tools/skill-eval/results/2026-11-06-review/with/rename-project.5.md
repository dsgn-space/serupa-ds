### Nice to have
1. **RenameProject.tsx:28: a failed save is shown as a field error**
   Problem: "We couldn't rename the project. Try again." is about the request, not the name. Inside `Field` it reads as a problem with the typed value.
   Fix: Keep "Enter a name for the project" on the `Field`. Show the save failure in an `Alert` (`variant="danger"`) at the top of the form, and still focus the input or the Alert.
   If skipped: Someone who sees the error may edit a name that was fine.

2. **RenameProject.tsx:40: the dialog can be closed while the save is running**
   Problem: Cancel and Esc stay active while `saving` is true. If the request fails after the dialog has closed, the error is set where nobody sees it, and `input.current?.focus()` does nothing. If it succeeds, the toast appears after the person has already dismissed the dialog.
   Fix: Set `disabled={saving}` on Cancel. Make `onOpenChange` ignore close requests while `saving`.
   If skipped: A failed rename can go unnoticed.

3. **RenameProject.tsx:16: unchanged names are still sent**
   Problem: Submitting the current name still calls `onRename` and shows "Project renamed".
   Fix: If `value.trim() === name`, call `setOpen(false)` and return without a toast.
   If skipped: An unneeded request, and a confirmation for something that didn't change.

Not visible in this file: this change calls `toast`, so the app root must render exactly one `<Toaster />`. I couldn't check that from this file.

Verdict: Ready to merge.