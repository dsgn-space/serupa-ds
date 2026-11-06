### Nice to have
1. **RenameProject.tsx:34: Dialog can be closed while the rename is saving**
   Problem: Cancel, Esc and the backdrop stay active during `saving`. If the person closes the dialog, a failed rename sets an error nobody sees, and a successful one still toasts with no context.
   Fix: Set `disabled={saving}` on Cancel, and make `onOpenChange` ignore close requests while `saving`. Also add `if (saving) return;` at the top of `rename`, so a second Enter can't start another request if `loading` doesn't block implicit submit.
   If skipped: A failed save after a close is silent, and a double submit is possible in an edge case.

2. **RenameProject.tsx:18: Unchanged name still calls `onRename`**
   Problem: Submitting the same name sends a pointless request and shows "Project renamed".
   Fix: After the empty check, add `if (value.trim() === name) { setOpen(false); return; }`.
   If skipped: People see a false confirmation and the server gets a no-op write.

3. **RenameProject.tsx:51: Button label is the bare verb "Rename"**
   Problem: It is correct and matches the dialog title's verb, so this is only a clarity point. "Rename project" would match the trigger and the title.
   Fix: Optional: change the label to "Rename project".
   If skipped: Nothing breaks.

Verdict: Ready to merge.