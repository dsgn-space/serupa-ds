# Review: `RenameProject`

The component is clean and follows the usual pattern for this kind of dialog. Its structure is sound: a controlled form, a trimmed value, state reset on open, and focus returned to the input on error. I couldn't check the `serupa-ds` APIs here, so the notes below are about the code as written.

## Should fix

1. **The dialog can be dismissed while a save is in flight.**
   - While `saving` is true, Cancel, Esc and the overlay click all still call `setOpen(false)`.
   - If the request then fails, `setError` runs on a closed dialog, so the user gets no feedback that the rename failed. If it succeeds, a toast appears for something they thought they'd cancelled.
   - Either ignore close requests while saving (`onOpenChange={(o) => !saving && setOpen(o)}` and `disabled={saving}` on Cancel), or tell the user the rename still happened.

2. **Pressing Enter can submit twice.**
   - `loading` on the submit button only blocks clicks. Enter in the input fires `onSubmit` again while the first request is pending, and whether it's blocked depends on how `Button` implements `loading`.
   - Add `if (saving) return;` at the top of `rename`. It's cheap and removes the dependency on `Button`'s behaviour.

3. **An unchanged name still hits the API.**
   - If `value.trim() === name`, the component makes a pointless request and shows "Project renamed". Close the dialog without calling `onRename` (and without the toast) in that case.

## Should consider

4. **The `catch` discards the error.**
   - A duplicate name, a permissions failure and a network failure all show "We couldn't rename the project. Try again." Retrying won't help for the first two.
   - Consider letting `onRename` reject with a user-safe message, for example `e instanceof Error ? e.message : fallback`. At minimum, log the error so failures can be debugged.

5. **Accessibility depends on `Field`.**
   - Confirm that `Field` wires `error` to the input through `aria-describedby` and `aria-invalid`, and announces it (`role="alert"` or a live region).
   - Moving focus to the input on error is good, but a screen reader user needs the message read out when that happens.

6. **Input details.**
   - Select the existing text on open (`onFocus={(e) => e.target.select()}`) so users can type over the old name.
   - Add `maxLength` if the backend limits name length. Otherwise users only find out through the generic error.
   - Add `autoComplete="off"` and `spellCheck={false}` if project names are identifiers.

7. **Toast copy.** "Project renamed" is fine. Including the new name ("Renamed to “X”") makes it more useful if the trigger sits somewhere the title isn't visible.

## Minor / nits

- `useState(name)` is redundant, because `show()` resets the value. Using `''` or keeping it are both fine. It does no harm.
- The `setSaving(false)` in `finally` can run after the component unmounts, for example if the parent navigates away on rename. This is harmless in React 18, but worth knowing about.
- Cancel and the dialog close both use `setOpen(false)` without clearing the error. That's fine, since `show()` resets it.

## Tests

No tests are included. These cases are worth covering:
- empty or whitespace-only input
- success (dialog closes, toast shown, trimmed value passed to `onRename`)
- failure (dialog stays open, error shown, input focused)
- double submit
- closing while a save is pending

**Verdict:** approve once items 1–3 are addressed. The rest are improvements.