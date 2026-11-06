## Review: `RenameProject`

The flow is sound overall. It resets state on open, trims input, clears the error on edit, and moves focus to the input on failure. I couldn't check the `serupa-ds` APIs from here, so the points that depend on them are flagged as "verify".

### Should fix

1. **Double submit is possible.** `rename` doesn't check `saving`. `loading` on the submit button may block clicks, but pressing Enter in the input still submits the form. Add `if (saving) return;` at the top of the handler.

2. **The dialog can be dismissed mid-save.** Cancel, Esc and the overlay all call `setOpen(false)` while the request is in flight.
   - **Failure after dismissal:** the error is set on a closed dialog, so the user never sees that the rename failed. `input.current?.focus()` then runs against an unmounted input.
   - **Success after dismissal:** the toast still appears, which is fine.
   - **Fix:** ignore close requests while saving, with `onOpenChange={(o) => !saving && setOpen(o)}`. Also pass `disabled={saving}` to Cancel.

### Should consider

3. **Unchanged name still hits the backend.** If `value.trim() === name`, close the dialog without calling `onRename` and without a "renamed" toast.

4. **Focus and selection on open.** If `Dialog` doesn't autofocus the first field (verify), add `autoFocus` to the input and select its text on focus. Renaming usually means replacing the text.

5. **Error semantics (verify).** Confirm that `Field` sets `aria-invalid` and `aria-describedby` on the child and announces the error (`role="alert"` or a live region). Otherwise screen reader users get neither the validation nor the failure message. Also confirm that `Input` forwards its ref. The code depends on `input.current` being non-null.

6. **The `catch` discards the error.** The user message is fine, but the failure is never logged or reported. If `onRename` can reject for a known reason such as a duplicate name or a permissions error, surface that instead of the generic copy.

### Nits

- Add `autoComplete="off"` and a `maxLength` that matches the backend limit.
- The toast could include the new name, for example `Renamed to "X"`.
- The `setOpen(false)` and `toast` calls after `await` can run after unmount if the parent unmounts the component. This is harmless in React 18 but worth knowing.
- No tests are included. Worth covering empty input, rejection (error shown, dialog stays open), success (dialog closes, toast shown), and Enter-key double submit.

### Verdict

Approve once #1 and #2 are fixed. The rest can be follow-ups.