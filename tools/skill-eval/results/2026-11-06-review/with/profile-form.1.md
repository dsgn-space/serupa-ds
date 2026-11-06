### Must fix

1. **ProfileForm.tsx: Email input has no label (the `Input` with `placeholder="Email"`)**
   Problem: The email `Input` sits outside a `Field` and uses a placeholder as its only name. The placeholder disappears once someone types, and screen readers get no reliable label.
   Fix: Wrap it in `<Field label="Email" hint="We only use your email to sign you in.">`, and use `type="email"` and `autoComplete="email"`.
   If skipped: Screen reader users can't tell what the field is for. Sighted users lose the label as soon as they type.

2. **ProfileForm.tsx: `style={{ outline: 'none' }}` on the email Input**
   Problem: This removes the focus ring with nothing in its place.
   Fix: Delete the style prop. The component already draws a focus ring from `focus-ring`. If you must hide an outline, use `outline-hidden`.
   If skipped: Keyboard users can't see where focus is on this field.

3. **ProfileForm.tsx: the error ("Invalid input") is not tied to its field, and focus doesn't move on a failed submit**
   Problem: The error appears after the submit button, away from the email field. The message doesn't say how to fix it. Focus stays on the button, and nothing announces the error. `Input` doesn't get `invalid`, so the field gives no sign it has an error.
   Fix: Keep the error per field and pass it to `Field` (`<Field label="Email" error={emailError}>`) with `invalid` on the `Input`. The text should say what to do: "Enter an email address, like name@example.com". On failure, move focus to the email input with a ref, or show an `ErrorSummary` at the top of the form.
   If skipped: Screen reader users may never hear that the submit failed. Sighted users have to hunt for the message.

4. **ProfileForm.tsx: help text in `text-blue-600` carries the only hint, outside any Field**
   Problem: A palette color is used for body text. It won't follow the theme or dark mode, and it isn't linked to the input it explains. This is also a color-by-hue problem, not a role (see Should fix).
   Fix: Move the text into the email `Field`'s `hint` (see 1) so it is read with the input.
   If skipped: Screen reader users don't hear the hint when they reach the email field.

### Should fix

1. **ProfileForm.tsx: `className="text-blue-600"`**
   Problem: `blue-600` is a palette color, so it looks the same in every theme and can fail contrast in dark mode.
   Fix: Use the role alias. Moving the text into `Field`'s `hint` (above) solves it. If you keep a `Text`, use `text-text-muted`.
   If skipped: Wrong color or poor contrast in other brands and in dark mode.

2. **ProfileForm.tsx: `<Button type="submit">Submit</Button>`**
   Problem: "Submit" doesn't say what the button does.
   Fix: Use "Save changes".
   If skipped: The button reads as generic, and the screen reader name tells people nothing about the result.

3. **ProfileForm.tsx: `label="Display Name"`**
   Problem: Title Case. The system uses sentence case.
   Fix: Use "Display name".
   If skipped: The copy is inconsistent with the rest of the app.

4. **ProfileForm.tsx: `setError('Invalid input')`**
   Problem: This is one of the banned messages. It doesn't say what to do.
   Fix: Use "Enter an email address, like name@example.com" (see Must fix 3).
   If skipped: People don't know how to fix the error.

5. **ProfileForm.tsx: `await onSave(name, email)` has no success feedback, no pending state and no error handling**
   Problem: Nothing tells the person the save worked, and a rejected promise goes unhandled. People can submit twice while it runs.
   Fix: Call `toast("Profile saved")` on success, with one `<Toaster />` at the app root. Catch a failure and show an `Alert` such as "We couldn't save your profile. Try again." Pass `loading` or `disabled` to the Button while saving, if Button supports it.
   If skipped: People can't tell whether the save worked, and double submits and silent failures can happen.

6. **ProfileForm.tsx: empty initial state**
   Problem: `name` and `email` start as `''`, so editing an existing profile shows a blank form.
   Fix: Take initial values as props (for example `defaultName` and `defaultEmail`).
   If skipped: Someone who only wants to change their name has to retype their email.

### Nice to have

1. **ProfileForm.tsx: `Field` for the name input**
   The display name field has no `required` or hint. Add a hint if there are length limits.

Verdict: Not ready: 4 must fix, 6 should fix.