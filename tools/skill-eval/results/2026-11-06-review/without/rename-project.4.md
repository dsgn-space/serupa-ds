## Review: `RenameProject`

The component is clean and mostly follows good form patterns: it resets state on open, focuses the input on errors, clears the error on edit, and the copy is clear. I found a few things to fix, and I couldn't check the serupa-ds details below against its source.

### Should fix

1. **Double submit is possible.** `loading` on the submit button probably blocks clicks, but pressing Enter in the input still fires `onSubmit`. Two quick Enters can send two `onRename` calls. Add `if (saving) return;` at the top of `rename`.

2. **The dialog can be closed mid-save.** `onOpenChange={setOpen}` and the Cancel button both close it while the request is in flight. That causes two problems:
   - On failure, the error and the `input.current?.focus()` call land on a closed dialog. The user sees no failure, and focus isn't restored anywhere sensible.
   - On success, the user gets a toast for a rename they thought they had cancelled.

   Ignore close requests while `saving` (`onOpenChange={(o) => !saving && setOpen(o)}`) and disable Cancel while saving. Alternatively, keep the dialog open and let the user cancel explicitly.

3. **The error is swallowed.** `catch {}` drops the cause, so there is nothing to debug with. The message "We couldn't rename the project" is also wrong when the real reason is something the user can fix, such as a duplicate name or a name that is too long. If `onRename` can reject with a typed or validation error, surface its message. At minimum, log the error.

### Worth considering

4. **Unchanged names are still submitted.** If `value.trim() === name`, this makes a network call and shows "Project renamed" for nothing. Close the dialog without calling `onRename`.

5. **Accessibility wiring depends on `Field`.** Confirm that `Field` links `error` to the input with `aria-describedby` and `aria-invalid`, and announces it with `role="alert"` or a live region. If it doesn't, the error will be silent for screen reader users. Also confirm that `Dialog` focuses the input on open and returns focus to the trigger on close. Selecting the existing text on open (`input.current?.select()`) would speed up editing.

6. **The input has no constraints.** There is no `maxLength`, `name` or `autoComplete="off"`. A browser may offer autofill suggestions on a "name" field. Add whatever limit the backend enforces so users don't hit it only after submitting.

7. **Submit events bubble through the portal.** React synthetic events propagate through portals. If this component is ever rendered inside another `<form>`, that outer form's `onSubmit` will also fire. Calling `e.stopPropagation()` in `rename` is cheap insurance.

### Minor

- `setSaving(false)` in `finally` runs after `setOpen(false)`, so the button briefly shows its non-loading state while the dialog animates out. This is cosmetic. Setting it only in the error path avoids it.
- There are no tests. Worth covering: empty name, success, failure, and Enter while saving.