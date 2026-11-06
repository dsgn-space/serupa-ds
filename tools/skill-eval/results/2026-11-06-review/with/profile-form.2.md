### Must fix
1. **ProfileForm.tsx:20: Email input has no label**
   Problem: The email `Input` sits outside a `Field` and uses a placeholder as its label. Screen reader users get no name once they type, and the hint is not tied to the field.
   Fix: Wrap it in `<Field label="Email" hint="We only use your email to sign you in.">` and remove the placeholder and the separate `Text` line.
   If skipped: Screen reader users can't tell what the field is for, and the placeholder disappears when typing.

2. **ProfileForm.tsx:20: `outline: 'none'` removes the focus ring**
   Problem: The inline style removes the focus indicator on the email field and nothing replaces it. Keyboard users can't see where they are.
   Fix: Delete the `style` prop. Input already shows `focus-ring`. If you need to hide the browser outline, use `outline-hidden`.
   If skipped: Keyboard users lose sight of focus on this field (WCAG 2.4.7).

3. **ProfileForm.tsx:12, 25: The error doesn't help and isn't next to the field**
   Problem: "Invalid input" doesn't say what to do. It renders at the bottom of the form, far from the email field. Nothing connects it to the field (no `invalid`, no `Field error`). Nothing moves focus to it on a failed submit, and it isn't announced.
   Fix: Use "Enter an email address like name@example.com". Pass it to `<Field error={error}>` and set `invalid` on the email `Input`. On a failed submit, focus the email input (or render an `ErrorSummary`). Remove the standalone error `Text`.
   If skipped: Screen reader and keyboard users won't know the submit failed or how to fix it.

### Should fix
1. **ProfileForm.tsx:21: Palette color `text-blue-600` for text**
   Problem: A hue doesn't follow the theme, and may fail contrast in dark mode.
   Fix: Use `text-text-muted` (or put the line in `Field hint`, which styles it for you).
   If skipped: The hint can be hard to read in some themes.

2. **ProfileForm.tsx:22: Button says "Submit"**
   Problem: The label doesn't say what the button does.
   Fix: Use "Save changes".
   If skipped: Inconsistent with Serupa's voice rules, and less clear to screen reader users.

3. **ProfileForm.tsx:17: "Display Name" is in Title Case**
   Problem: Serupa uses sentence case.
   Fix: "Display name".
   If skipped: The label is inconsistent with the rest of the app.

4. **ProfileForm.tsx:9–13: No saved confirmation and no failure handling**
   Problem: `await onSave(...)` shows nothing on success, and a rejection is unhandled, so people can't tell whether it worked. The form also lets people press the button again while saving.
   Fix: Call `toast("Saved")` after success (with one `<Toaster />` at the app's root). Catch a failure and show it with `Alert` or the `Field` error: "We couldn't save your profile. Try again." Disable the button, or set its loading state, while saving.
   If skipped: Silent saves, unhandled promise rejections and double submits.

5. **ProfileForm.tsx:20: Email input lacks `type="email"` and `autoComplete`**
   Problem: People get the wrong keyboard on mobile and no autofill. The `includes('@')` check is weak.
   Fix: Add `type="email"`, `autoComplete="email"` and `name="email"`. Add `autoComplete="name"` to the name field too.
   If skipped: More typing and more errors, especially on phones.

### Nice to have
1. **ProfileForm.tsx:7–8: The form starts empty**
   Problem: People editing an existing profile see blank fields.
   Fix: Accept initial values as props.

Verdict: Not ready: 3 must fix, 5 should fix.