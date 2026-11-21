---
"@diki-stwn/serupa-ds": minor
---

Added: `Form`, a form checked against one schema, with `FormSteps`, `useForm` and `useFormValue`.

- **One schema, no wiring:** pass a Zod, Valibot or ArkType schema (any [Standard Schema](https://standardschema.dev); Serupa depends on none of them). Each Field finds its message by its control's `name` (`email`, `address.city`, a FieldList row's `people[1].email`), and `onSubmit` gets the schema's output, typed.
- **When it checks:** a field when it's left, again as it changes once it has shown a message, everything on submit. A failed submit shows an ErrorSummary at the top that links to each field and takes focus, and the page's title starts with "Error:".
- **The server's answer:** return `{ errors, message }` from `onSubmit`, or pass `errors`, and each message shows on its field and in the summary.
- **Patterns:** `FormSteps` (steps with a progress bar; Next checks only the step's fields), `checks` (async checks such as "That username is taken", with "Checking…"), `draft` (answers kept in the browser, never passwords or card numbers), `warnUnsaved` and `onUnsavedChanges` (ask before leaving with changes), `useFormValue` (fields that depend on others), and FieldList rows as arrays.
- A submit Button inside a Form shows loading while `onSubmit` runs. New words `formErrorTitle`, `formChecking`, `formNext` and `formBack` in every label pack.
- New guide: Guides/Build a form, with sign-up, checkout and settings start to finish.
