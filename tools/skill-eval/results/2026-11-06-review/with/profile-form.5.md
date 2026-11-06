### Must fix
1. **ProfileForm.tsx:20: Email input has no label**
   Problem: The email `Input` sits outside a `Field` and uses a placeholder as its label, so screen reader users get no name once they type, and the hint text isn't tied to it.
   Fix: Wrap it in `<Field label="Email" hint="We only use your email to sign you in.">` and drop the placeholder and the separate hint `Text`.
   If skipped: People who use a screen reader can't tell what the field is for. Sighted users lose the label as soon as they start typing.

2. **ProfileForm.tsx:20: `outline: 'none'` on the email input**
   Problem: The inline style removes the focus ring and puts nothing in its place, so keyboard users can't see where they are.
   Fix: Delete the `style` prop. The component's own focus ring (`focus-ring` token) already works.
   If skipped: Keyboard users lose track of focus in the form, which fails WCAG 2.4.7 (Focus Visible).

3. **ProfileForm.tsx:11 and :25: The error is neither next to its field nor reachable, and it doesn't say how to fix it**
   Problem: "Invalid input" appears below the Submit button, far from the email field. The field isn't marked invalid, and focus doesn't move on a failed submit, so screen reader and keyboard users never find the error.
   Fix: Keep the error in state and pass it to the field: `<Field label="Email" error={error}>` with `<Input invalid={!!error} type="email" autoComplete="email" … />`. Use the message "Enter an email address like name@example.com". On failure, move focus to the email input with a ref, or render an `ErrorSummary`. Remove the standalone error `Text`.
   If skipped: People using a screen reader or keyboard don't know the save failed or what to change.

### Should fix
1. **ProfileForm.tsx:24: Button label "Submit"**
   Problem: The label doesn't start with a verb that says what it does.
   Fix: Change it to "Save changes".
   If skipped: The button's purpose is vague, and the wording is inconsistent with the rest of the system.

2. **ProfileForm.tsx:21: Palette color `text-blue-600`**
   Problem: A palette hue is used where a role alias fits, so it won't follow the theme. It may also miss contrast in dark mode or other brands.
   Fix: Move the text into the `Field` hint (see Must fix 1). If it stays as `Text`, use `text-text-muted`.
   If skipped: The text keeps the same blue in every theme and can fail contrast or clash with the brand.

3. **ProfileForm.tsx:17: Label "Display Name" is in Title Case**
   Problem: Serupa uses sentence case everywhere.
   Fix: Change it to "Display name".
   If skipped: The form's copy is inconsistent with the rest of the app.

4. **ProfileForm.tsx:12: No feedback on save, and a failed save is unhandled**
   Problem: `await onSave(...)` shows nothing on success, and if it rejects, the error is unhandled and the user gets no message. Nothing stops a double submit while it runs.
   Fix: On success call `toast("Profile saved")`, and make sure the app has one `<Toaster />`. Wrap the call in `try/catch` and show an `Alert` with "We couldn't save your profile. Try again." on failure. Set `loading` or `disabled` on the Button while saving, if Button supports it.
   If skipped: People can't tell whether the save worked, and a network failure leaves the form silent.

### Nice to have
1. **ProfileForm.tsx:7-8: Empty initial values**
   Fix: Prefill `name` and `email` from the current profile, passed in as props, so the form shows what's saved. Also set `autoComplete="name"` on the name input.

Verdict: Not ready: 3 must fix, 4 should fix.