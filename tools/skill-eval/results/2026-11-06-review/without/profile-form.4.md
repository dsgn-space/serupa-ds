## Review: `ProfileForm`

I reviewed this from the code alone. I didn't check the `serupa-ds` API, so confirm the DS-specific suggestions (`Field` props, tokens) against its docs.

### Must fix

1. **Focus indicator removed** (`style={{ outline: 'none' }}` on the email `Input`). Keyboard users lose the focus ring, which fails WCAG 2.4.7. It also overrides the DS focus styling, so the email field looks different from the name field. Delete the style prop.

2. **Email input has no label.** It uses a placeholder only, so the label disappears once the user types and screen readers get no reliable name. It's also the only input not wrapped in `Field`, so spacing and styling are inconsistent with the name field. Use `<Field label="Email">…</Field>`.

3. **The error isn't accessible or connected to the field.**
   - It renders as a plain `Text` at the bottom of the form, away from the input it describes.
   - It isn't announced to screen readers, because it has no `role="alert"` or live region.
   - The input has no `aria-invalid` or `aria-describedby`.
   - If `Field` supports an `error` or `hint` prop, use it. That should wire all of this up and place the message next to the input.

4. **`onSave` failures aren't handled.** `await onSave(...)` has no try/catch, so a rejection becomes an unhandled promise rejection and the user sees nothing. Catch it and show an error. Also show a success state, since the user currently gets no confirmation that anything saved.

5. **No pending state.** The button stays active during the request, so a double click saves twice. Track `submitting`, then disable the button or use the DS loading state if it has one.

### Should fix

6. **Error copy.** "Invalid input" doesn't say which field or how to fix it. Use something like "Enter a valid email address, like name@example.com." The error also never clears after the user edits the field or submits successfully.

7. **Email validation and input attributes.**
   - `includes('@')` accepts `@` and `a@`.
   - Use `type="email"`, `autoComplete="email"` and `inputMode="email"`. Add `autoComplete="name"` on the name field.
   - If you keep custom validation, add `noValidate` on the form so the browser's validation doesn't conflict with it.
   - Name is never validated or marked required.

8. **Off-token color.** `text-blue-600` is a raw palette color, while the error uses a semantic token (`text-danger-text`). It won't follow theming or dark mode and may fail contrast. Use the DS's secondary or helper text style. Better, make it the email field's hint so it stays attached to the field.

9. **The form is always empty.** A profile form should show the user's current name and email. Add `initialName` and `initialEmail` props, or make it controlled. As written, saving without retyping everything overwrites the profile with blanks, and the name has no empty check.

### Nits

- The button says "Submit". "Save changes" matches the action better.
- Use sentence case for "Display name" if that's the DS convention.
- The helper text sits between the email field and the button. Once it's the email field's hint, it will read in the right place.