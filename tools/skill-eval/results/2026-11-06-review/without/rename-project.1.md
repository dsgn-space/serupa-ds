## Review: `RenameProject`

The component is well structured. It has inline validation with focus management, a loading state, a `try/finally` that resets `saving`, and clear copy. I couldn't check the `serupa-ds` prop names (`Field error`, `Button loading`, `Stack justify`, and so on) against the library, so confirm those against its types.

### Should fix

1. **Enter can submit twice.** `loading` on the button only stops clicks. Pressing Enter in the input while a request is in flight fires `onSubmit` again, and `onRename` is called twice. Add `if (saving) return;` at the top of `rename`.

2. **A failure after dismissing is silent.** Cancel, Esc and overlay click all stay live during `saving`. If the user closes the dialog and the request then fails, the code sets `error` on a closed dialog and nothing is shown. Either block dismissal while saving (`onOpenChange={(o) => !saving && setOpen(o)}` and `disabled={saving}` on Cancel), or call `toast.error` when the dialog is no longer open.

### Should consider

3. **The error handling hides the cause.** The bare `catch {}` swallows the error. A duplicate name, a permission failure and a network error all show "We couldn't rename the project." If `onRename` can reject with a useful message, show it. At the least, log the error.

4. **An unchanged name still calls the API.** If `value.trim() === name`, close the dialog without calling `onRename`. This also avoids a pointless "Project renamed" toast.

5. **Focus after success.** If the parent re-renders and unmounts or replaces the trigger button, the dialog can't return focus to it, and focus drops to `<body>`. Check this in the parent.

### Nits

- Select the text when the dialog opens, so the user can type a replacement straight away. For example, call `input.current?.select()` once the dialog has mounted.
- Add `autoComplete="off"` and a `maxLength` that matches the backend limit. If the backend has a limit, a client-side check will give a better error than a server rejection.
- `name` is copied into state only in `show()`. If the prop changes while the dialog is open, the input won't update. That is probably fine, but it is deliberate behavior.
- The submit button reads "Rename" under the title "Rename project". That is acceptable, but a verb that matches the title ("Rename project") is slightly clearer for screen reader users.
- There are no tests. Worth covering: empty submit, the failure path keeping the dialog open with the error shown, and no double-submit.