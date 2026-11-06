### Must fix

1. **ProfileForm.tsx:16: Email input has no name**
   Problem: The email `Input` sits outside a `Field` and uses a placeholder as its label. Screen reader users get no label, and the placeholder disappears once someone types.
   Fix: Wrap it in `<Field label="Email" hint="We only use your email to sign you in.">`. Use `type="email"` and `autoComplete="email"`.
   If skipped: Screen reader users can't tell what the field is for, and sighted users lose the label as they type.

2. **ProfileForm.tsx:16: `outline: 'none'` removes the focus ring**
   Problem: The inline `style={{ outline: 'none' }}` removes the focus indicator and puts nothing in its place. Keyboard users can't see where they are.
   Fix: Delete the `style` prop. The `Input` already shows a focus ring from `--focus-ring`.
   If skipped: Keyboard users lose their place in the form (WCAG 2.4.7).

3. **ProfileForm.tsx:11: The error doesn't help and isn't next to its field**
   Problem: `'Invalid input'` doesn't say what to do. It renders after the submit button, away from the email field. It isn't tied to the field, and focus doesn't move to it on submit.
   Fix: Set the message to "Enter an email address with an @, like name@example.com". Pass it to the email `Field` as its error, and set `invalid` on the `Input`. Move focus to the email input in the failed branch, using a ref. If the form grows, use an `ErrorSummary`.
   If skipped: Screen reader users may never hear the error, and nobody knows how to fix it.

4. **ProfileForm.tsx:20: Error text can't be heard**
   Problem: The error `Text` has no live region and is detached from the input. It is shown only as red text, so color carries the meaning.
   Fix: Replace it with `Field`'s error prop, which links the error to the control for screen readers. Keep the message text, which doesn't rely on color.
   If skipped: Screen readers never announce the failure.

### Should fix

1. **ProfileForm.tsx:19: Palette color on text**
   Problem: `text-blue-600` is a fixed hue that ignores the theme. It may not meet contrast in dark mode or the other brands.
   Fix: Use `text-text-muted`, or move the sentence into the email `Field`'s `hint` (see Must fix 1) and drop the class.
   If skipped: The hint looks the same in every theme and may fail contrast in dark mode.

2. **ProfileForm.tsx:20: Submit button text**
   Problem: "Submit" doesn't start with a verb that says what it does.
   Fix: Use "Save changes".
   If skipped: The button gives no hint of its outcome. This also breaks the Serupa content rules.

3. **ProfileForm.tsx:14: Label in Title Case**
   Problem: "Display Name" breaks the sentence-case rule.
   Fix: Use "Display name".
   If skipped: The label is inconsistent with the rest of the Serupa app.

4. **ProfileForm.tsx:9: Save has no feedback and no error handling**
   Problem: `await onSave(...)` shows nothing on success and has no `try/catch`, so a rejected promise surfaces as an unhandled error. There's also no pending state, so a double click sends it twice.
   Fix: On success, call `toast("Profile saved")` and make sure one `<Toaster />` exists at the app root. Wrap the call in `try/catch` and show a persistent `Alert` such as "We couldn't save your profile. Try again." on failure. Track a `saving` state and set `loading` or `disabled` on the Button.
   If skipped: People can't tell whether the save worked. A failed save looks the same as a successful one.

5. **ProfileForm.tsx:6-7: Form starts empty**
   Problem: The state starts as `''` for both fields, so an edit form for an existing profile shows blank values.
   Fix: Accept `initialName` and `initialEmail` props, or the current profile, and use them as the initial state.
   If skipped: Users appear to have no profile data, and saving can overwrite it with blanks.

### Nice to have

1. **ProfileForm.tsx:14: Name field has no autocomplete**
   Problem: There's no `autoComplete="name"` on the name input.
   Fix: Add it. Also consider `required` on both fields.
   If skipped: Browsers can't autofill the field.

Verdict: Not ready: 4 must fix, 5 should fix.