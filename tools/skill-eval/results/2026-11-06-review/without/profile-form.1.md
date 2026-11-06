**Review of `ProfileForm`**

I couldn't read the serupa-ds docs or source in this session. Findings that depend on its conventions are marked "verify".

**Bugs and functional issues**

1. **The email input has no label.** A placeholder isn't an accessible name, and it disappears once the user types. The name input is wrapped in `<Field label=...>`, so the email input should be too. This is a WCAG 1.3.1 / 3.3.2 / 4.1.2 failure and an inconsistency within the same form.
2. **`style={{ outline: 'none' }}` removes the focus indicator.** Keyboard users lose all focus feedback (WCAG 2.4.7). Delete it. serupa-ds `Input` should already have a focus style. Inline styles also bypass the design system.
3. **The error message is generic and not tied to the field.** "Invalid input" doesn't say which field or why. Use something like "Enter a valid email address, like name@example.com". It is also rendered below the submit button, away from the input, with no `aria-live`, `role="alert"`, or `aria-describedby`. Screen reader users won't hear it. Verify whether `Field` supports an `error` or `invalid` prop. If it does, use it so the error, `aria-invalid` and `aria-describedby` are wired up for you.
4. **`!email.includes('@')` is very weak validation.** It accepts `@`, `a@`, and `@b`. Use `type="email"` on the input, which also gives mobile keyboards and autofill. Optionally add a stricter check. Don't rely on `type="email"` alone with `onSubmit`, because the browser's native validation UI may or may not fire depending on `noValidate`.
5. **The error is never cleared.** After a failed attempt, the message stays after the user fixes the email. It only goes away if `setError('')` is called, and nothing calls it. Clear it on change or at the start of `save`.
6. **`onSave` rejections are unhandled.** If the promise rejects, the user sees nothing, and `save` produces an unhandled rejection. Wrap it in try/catch and show a failure message.
7. **There is no pending state.** `await onSave` can take a while, and the button stays enabled, so users can double-submit. Track `isSubmitting` and disable the button (or use a `loading` prop, if serupa-ds `Button` has one). Use `finally` to reset it.
8. **The form never loads the user's existing profile.** Both fields start as `''`. On an account page the form will presumably edit existing data. Take `initialName` and `initialEmail` (or `defaultValues`) as props. Otherwise saving overwrites the profile with blanks. Name is also never validated, so an empty name is saved.

**Design-system compliance (verify against serupa-ds)**

9. **`className="text-blue-600"` is a hardcoded palette color.** It bypasses semantic tokens and will probably break in dark mode or when themes change. Use the design system's semantic text token, or a `Text` prop such as `tone="muted"` or `variant="caption"`. This line is helper text, so see item 11.
10. **`text-danger-text` is the right kind of token for the error, but check the name.** If `Text` or `Field` has an error or `intent="danger"` variant, prefer it over a utility class.
11. **The helper text is a loose `Text` sibling.** It should be the email field's description, associated through `aria-describedby`. Look for `Field`'s `description` or `hint` prop. The copy is also unclear. "We only use your email to sign you in" reads as a privacy claim rather than guidance. If it's accurate, keep it, but attach it to the field.
12. **The submit button says "Submit".** Use a specific verb, such as "Save changes". The callback is named `onSave`, so the button copy should match.
13. **The label casing is inconsistent.** "Display Name" is Title Case. Use sentence case ("Display name"), and apply the same casing to the email label once it has one.
14. **Stack gap.** `gap={4}` may be fine, but confirm it is a valid token value and not a raw number the `Stack` API doesn't accept.

**Minor**

- Add `autoComplete="name"` and `autoComplete="email"` to the inputs.
- `import * as React` is fine, but if the project uses the automatic JSX runtime with named imports, follow that convention.
- The `onSave(name, email)` signature gets awkward as fields grow. Consider passing `{ name, email }`.
- There are no tests. At minimum, cover invalid email, a successful save, and a rejected save.

**Suggested shape**

```tsx
<Field label="Email" description="We only use your email to sign you in." error={emailError}>
  <Input type="email" autoComplete="email" value={email}
         onChange={(e) => { setEmail(e.target.value); setError(''); }} />
</Field>
...
<Button type="submit" disabled={saving}>Save changes</Button>
```

(`description` and `error` are guesses at the `Field` API. Adjust them to what serupa-ds actually exposes.)

**Verdict:** Request changes. Items 1–3 are accessibility blockers, and items 5–8 are real functional gaps. Fix those before merging. The remaining items are mostly design-system cleanup.