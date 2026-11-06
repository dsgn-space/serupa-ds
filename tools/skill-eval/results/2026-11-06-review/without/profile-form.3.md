## Review: `ProfileForm`

I reviewed the code as written. I didn't check it against serupa-ds docs, so the points about DS conventions assume `Field` and `Text` work the way their usage here suggests.

### Must fix

1. **Focus indicator removed** (`style={{ outline: 'none' }}` on the email `Input`). Keyboard users get no visible focus on this field. It also overrides the DS's own focus styling, and the name field doesn't do it, so the two inputs behave differently. Delete the style.

2. **The email input has no label.** It's the only input outside a `<Field>`, and its only label is a placeholder, which disappears as soon as the user types. Screen readers may announce it with no name at all. Wrap it in `<Field label="Email">`, like the name input. While you're there, add `type="email"`, `autoComplete="email"` and `name` attributes. The same attributes (`autoComplete="name"`, `name`) apply to the name input.

3. **Errors are vague and not tied to the field.**
   - "Invalid input" doesn't say what's wrong or how to fix it. Try "Enter a valid email address, like name@example.com".
   - The message renders below the Submit button, away from the field it describes.
   - It has no `role="alert"` and no `aria-describedby`/`aria-invalid` link to the input, so screen readers won't announce it. If `Field` has an `error` prop, use that.
   - It never clears when the user edits the email or after a successful save.
   - `includes('@')` accepts `"@"` and `"a@"`. `type="email"` plus a slightly stricter check would be better.

4. **`onSave` has no failure or pending handling.**
   - If `onSave` rejects, you get an unhandled rejection and the user sees nothing.
   - There is no loading state, so a double-click sends two saves. Track a `saving` state, disable the button or use the DS loading prop, and wrap the call in `try/catch/finally`.
   - There is no success feedback either.

### Should fix

5. **Design-system bypass.** `className="text-blue-600"` is a raw palette color, while the error text uses a semantic token (`text-danger-text`). Use a semantic text token or the `Text` color/variant prop for secondary text. Blue also reads as a link. If `Field` supports a hint/description prop, use it so the text is linked to the input via `aria-describedby` and stays next to the field it explains.

6. **The form starts empty.** On an account page the fields should be prefilled with the user's current name and email. Otherwise saving after changing only one field overwrites the other with an empty string. Take `initialValues` as a prop, or at least validate that name isn't empty. Trim the values before saving.

7. **Copy.** The button says "Submit". Use "Save changes" or "Save profile" to match the action. "Display Name" should be "Display name" if the DS uses sentence case.

### Nits

- `onSave(name, email)` takes two positional strings that are easy to swap. Consider `onSave({ name, email })`.
- The Email field and its helper text should keep their order and sit together. Moving the helper text into the field (point 5) fixes this.
- No tests are included. Cases worth covering: invalid email blocks save, a rejected save shows an error, and the button is disabled while saving.