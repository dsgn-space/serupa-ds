## Review: `ProfileForm`

### Must fix

1. **Focus indicator removed.** `style={{ outline: 'none' }}` on the email `Input` leaves keyboard users with no visible focus (WCAG 2.4.7). It also overrides the design system with an inline style. Remove it and let `Input` handle focus.

2. **Email field has no label.** The name field is wrapped in `Field label=…`, but the email field relies on `placeholder="Email"`. The placeholder disappears once the user types, and it isn't a reliable accessible name. Wrap it in `<Field label="Email">` like the name field.

3. **`onSave` failures are unhandled.** `await onSave(...)` has no `try/catch`. A rejected promise gives the user no feedback, and the form looks like it did nothing. Catch the error and show a message.

4. **No pending state, so double submits are possible.** Track `saving`, set it around the `await`, and disable the button or show its loading state. There is also no success confirmation after save.

5. **The error is vague and detached from the field.**
   - "Invalid input" doesn't say what is wrong or how to fix it. Use something like "Enter a valid email address, like name@example.com."
   - The message renders below the submit button, far from the email field.
   - It has no `aria-invalid` or `aria-describedby` link to the input, and no `role="alert"`, so screen readers won't announce it.
   - It is never cleared when the user edits the field or resubmits successfully.
   - If `Field` supports an `error` prop (or similar), use it. That gives you the wiring for free.

6. **Raw color classes bypass the design system.**
   - `text-blue-600` is a hardcoded palette color. It won't follow theming or dark mode, and its contrast isn't guaranteed. Use a `Text` variant or tone for secondary or help text.
   - `text-danger-text` also looks like a hand-picked token. Check that it exists, and prefer the DS's built-in error styling.
   - I haven't confirmed which props `serupa-ds` exposes. Check its `Field`/`Text` API before choosing the replacements.

### Should fix

7. **Initial values are empty.** This is an account page, so the form should be prefilled with the current profile (`initialName`/`initialEmail` props, or a `defaultValues` object). As written, saving without retyping the name overwrites it with `''`. The name is also neither required nor validated.

8. **Email validation is too weak.** `includes('@')` accepts `@` or `a@`. Use `type="email"` plus `required` for native validation, trim the value, and use a stricter check. Server-side validation is still the real gate.

9. **Missing input attributes.** Add `type="email"`, `autoComplete="email"`, `name="email"` and `autoComplete="name"` on the name field. These help mobile keyboards, autofill and password managers.

10. **Help text isn't tied to the field.** "We only use your email to sign you in." should be the field's hint or description, so it sits next to the email input and is announced with it. Right now it floats between the field and the button.

### Nits

- Button label: "Submit" is generic. "Save changes" matches what the form does.
- Casing: use "Display name" if the DS uses sentence case for labels.
- Tests: the change adds no tests. At minimum, cover invalid email, the rejected `onSave` path, and a double-click on submit.

### Suggested shape

```tsx
<Field label="Email" hint="We only use your email to sign you in." error={emailError}>
  <Input type="email" name="email" autoComplete="email" required
         value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} />
</Field>
<Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
```

Adjust prop names to what `serupa-ds` actually provides.