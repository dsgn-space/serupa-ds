**Review: `ProfileForm`**

**Must fix**

1. **The email field has no label.** The name input is wrapped in `Field label="Display Name"`, but the email `Input` is bare and uses `placeholder="Email"` as its only label. The placeholder disappears once the user types, and it isn't a reliable accessible name. Wrap it in `<Field label="Email">` like the name input. Also set `type="email"` and `autoComplete="email"`, and `autoComplete="name"` on the name input.

2. **`style={{ outline: 'none' }}` removes the focus indicator.** Keyboard users lose all sign of where focus is (WCAG 2.4.7). It also overrides whatever focus ring serupa-ds provides. Delete it. If the default ring looks wrong, fix that in the design system rather than here.

3. **The error message is generic and disconnected from the field.**
   - "Invalid input" doesn't say which field is wrong or how to fix it. Use something like "Enter an email address like name@example.com."
   - The message renders below the Submit button, away from the field it describes.
   - It isn't announced to screen readers. Pass the error through `Field`'s error or validation prop if serupa-ds has one. Otherwise render it directly under the email input with `role="alert"` (or `aria-live`), and set `aria-invalid` and `aria-describedby` on the input.
   - Move focus to the invalid field on failure.
   - The error is never cleared. After the user fixes the email and resubmits, the stale message stays until a successful path, and there isn't one because nothing resets it. Call `setError('')` at the start of `save`, or in the email `onChange`.

4. **`onSave` is unguarded.**
   - There is no try/catch, so a rejected promise becomes an unhandled rejection and the user sees nothing.
   - There is no pending state, so double-clicking Submit fires `onSave` twice.
   - Add `submitting` state. Disable the button, or use the Button's `loading` prop if it has one. Catch failures and show an error message.
   - There is no success feedback either.

5. **Hard-coded colours bypass the design system's tokens.**
   - `className="text-blue-600"` is a raw Tailwind palette colour. It won't follow theming or dark mode, and blue text reads as a link. Use the DS text variant or token for secondary or helper text, for example `Text`'s `color` or `variant` prop if it exists.
   - `text-danger-text` looks like a token, but I couldn't check it against serupa-ds. Prefer the DS's error or critical text prop on `Text` over a class name.
   - The helper text is better as the `Field`'s hint or description slot if one exists. That also links it to the input for assistive tech.

**Should fix**

6. **Email validation is too weak.** `includes('@')` accepts `@`, `a@`, and `@b`. Use `type="email"` plus a stricter check, or at minimum a light regex. Trim the value too. Don't over-engineer it, since the server must validate anyway.

7. **The name is never validated.** An empty name can be submitted. Either make it required (with a visible indicator) or document that it's optional.

8. **The form starts empty.** On an account page, users expect to see their current name and email. Accept `initialValues` or `defaultValues` props. As written, saving with a blank name could overwrite existing data.

9. **The button label is generic.** "Submit" should be "Save changes" or "Save profile", which matches the `onSave` prop and the action. Text-wise, "Display Name" should probably be "Display name" (sentence case) to match typical UI copy. Check against the rest of the app.

10. **Layout and consistency.**
    - The two inputs are not treated alike (one in `Field`, one not), which is the root of items 1, 3 and 5.
    - If `Stack` supports a `gap` token scale, `gap={4}` is fine. Verify it's a valid value in serupa-ds.

**Nits**

- The `(name, email)` positional arguments to `onSave` are easy to swap. Consider `onSave({ name, email })`.
- Add an explicit return type or props interface (`ProfileFormProps`) so it can be exported and documented.
- `import * as React` is fine, but named imports (`useState`) would be more consistent with the DS import style, if the repo prefers that.
- There are no tests. At minimum, cover invalid email, a successful save, and a rejected `onSave`.

**Caveat:** I couldn't inspect the repo or the serupa-ds docs in this session, so the prop names I mention (`loading`, `Field` error/hint slots, `Text` colour variants, valid `Stack` gap values) are suggestions to verify against the library. The accessibility issues (items 1–3) and the missing error handling (item 4) hold regardless.

**Verdict:** Request changes. Items 1–5 should be fixed before merge.