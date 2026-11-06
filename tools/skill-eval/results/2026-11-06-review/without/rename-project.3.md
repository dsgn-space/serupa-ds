## Review: `RenameProject`

The component is well built overall. It resets state on open, clears the error on edit, moves focus to the input on error, trims input, and has a submit-button loading state. These are the issues I found, most important first.

### Should fix

1. **Enter can submit twice while saving.** `loading` on the submit button doesn't stop Enter in the input from re-firing `onSubmit`. If `loading` only disables or marks the button busy, a second `onRename` call goes out. Add `if (saving) return;` at the top of `rename`.

2. **Closing mid-request hides failures.** `Escape`, an overlay click and Cancel all call `setOpen(false)` while `saving` is true.
   - If the request then fails, `setError` and `focus()` run against a closed dialog. The user sees nothing and may think the rename worked.
   - If it succeeds, a "Project renamed" toast appears from a dialog they already dismissed. That's acceptable, but only the failure case is a real problem.
   - Fix: ignore close requests while saving with `onOpenChange={(o) => !saving && setOpen(o)}` and `disabled={saving}` on Cancel. Alternatively, show an error toast when the failure happens after the dialog has closed.

### Should consider

3. **No-op rename calls the backend.** If `value.trim() === name`, the component still calls `onRename`, then shows a success toast for a change that didn't happen. Close the dialog without calling it, or disable the submit button until the value differs.

4. **The failure message drops the cause.** The bare `catch` shows the same text for a name conflict, a permissions error and a network failure, and it logs nothing. Either let `onRename` throw an error with a user-safe `message` and show that, or at least keep the generic message and log the error.

5. **Accessibility depends on `Field` and `Dialog`, which I haven't checked against serupa-ds.** Please confirm that:
   - `Field` sets `aria-invalid` and `aria-describedby` on the child input, and announces `error` through a live region. Moving focus to the input does help, but only if the error is tied to it.
   - `Dialog` returns focus to the trigger button on close, and the toast is announced politely.
   - If `Field` doesn't pass `ref` and props through to a custom `Input`, `input.current` will be null and the focus calls will silently do nothing.

### Nits

- Select the existing text when the dialog opens (`onFocus={(e) => e.target.select()}`). It makes replacing the name quicker.
- Add `maxLength` and `autoComplete="off"` to the input if the backend limits name length.
- The trigger, the dialog title and the submit button are all labelled "Rename" or "Rename project". That's fine for sighted users, but a screen-reader user hears a lot of repetition. The submit label could be "Save" or "Rename".
- There are no tests. Worth covering: empty input shows the error and focus, a rejected `onRename` shows the error and keeps the dialog open, a successful one closes it and toasts, and a double-submit makes a single call.

**Verdict:** Approve once items 1 and 2 are fixed. Items 3–5 can be follow-ups.