### Must fix

1. **ProfileForm.tsx: Email `Input` has no `Field` or label (placeholder only)**
   Problem: The email control is outside a `Field` and uses `placeholder="Email"` as its name. The placeholder disappears once someone types, and the control has no label, hint or error wired up for screen readers.
   Fix: Wrap it in `<Field label="Email" hint="We only use your email to sign you in." error={error}>` and set `type="email"` and `autoComplete="email"`. Pass `invalid={!!error}` to the `Input`.
   If skipped: Screen reader users get no reliable name for the field. Sighted users lose the label as soon as they type.

2. **ProfileForm.tsx: `style={{ outline: 'none' }}` on the email `Input`**
   Problem: This removes the focus ring with nothing in its place, so keyboard users can't see where focus is.
   Fix: Delete the `style` prop. Serupa's focus ring comes from the component. Use `outline-hidden` only if you must hide the outline.
   If skipped: Keyboard users lose track of focus in the form. This fails WCAG 2.4.7.

3. **ProfileForm.tsx: error is not next to the field and focus doesn't move**
   Problem: The error `Text` sits after the submit button, away from the email field. It isn't tied to the field, and focus stays on the button after a failed submit. Screen reader users aren't told anything went wrong.
   Fix: Pass the error to `Field`'s `error` prop, which places it beside the control and links it to the input. On a failed submit, focus the email input with a ref, or render an `ErrorSummary` above the form.
   If skipped: Screen reader and keyboard users don't find out the submit failed, or where.

4. **ProfileForm.tsx: the error message "Invalid input" doesn't help**
   Problem: It doesn't say what's wrong or how to fix it.
   Fix: Use "Enter an email address like name@example.com".
   If skipped: Users have to guess what's wrong. This fails WCAG 3.3.3.

### Should fix

1. **ProfileForm.tsx: `className="text-blue-600"` on the helper `Text`**
   Problem: This is a palette color. It looks the same in every theme and can fail contrast in dark mode. It also reads like a link or a brand color.
   Fix: Move the sentence into `Field`'s `hint` (see Must fix 1). If it stays as `Text`, use `text-text-muted`.
   If skipped: The text ignores the user's theme and brand, and may be hard to read in dark mode.

2. **ProfileForm.tsx: button reads "Submit"**
   Problem: The label doesn't say what the button does.
   Fix: Use "Save changes", which matches the `onSave` handler.
   If skipped: The button's purpose is less clear, especially to screen reader users who browse by controls.

3. **ProfileForm.tsx: label reads "Display Name"**
   Problem: This is Title Case. Serupa uses sentence case.
   Fix: Use "Display name".
   If skipped: The labels don't match the rest of the app.

4. **ProfileForm.tsx: no feedback after a successful save, and no pending state**
   Problem: `await onSave(...)` resolves silently. The button can be pressed again while the save runs, and a rejected `onSave` goes unhandled, with nothing shown to the user.
   Fix: Call `toast("Profile saved")` on success, with one `<Toaster />` at the app's root (check it isn't added twice). Put the save in a `try/catch`. On failure, show "We couldn't save your profile. Try again." in an `Alert` that stays until dealt with. Pass `loading` or `disabled` to the `Button` while saving.
   If skipped: People don't know whether the save worked, can submit twice, and an unhandled failure looks like nothing happened.

5. **ProfileForm.tsx: the `Error` state is never cleared**
   Problem: `error` stays set after the user fixes the email. It is only reset on the next failed submit, and never reset on a successful one.
   Fix: Call `setError('')` at the start of `save`, or when the email changes.
   If skipped: A stale error stays next to a field that is now valid.

### Nice to have

1. **ProfileForm.tsx: validation `email.includes('@')`**
   Problem: It accepts values like `@` or `a@`. Name also has no check, so an empty name saves.
   Fix: Rely on `type="email"` plus a stricter check, and add "Enter your name" for an empty name, using the same `Field` error pattern.

2. **ProfileForm.tsx: initial state is empty**
   Problem: This is an edit form on the account page, so it opens blank rather than showing the current profile.
   Fix: Accept initial values as props, such as `defaultName` and `defaultEmail`.

Verdict: Not ready: 4 must fix, 5 should fix.