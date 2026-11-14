---
"@diki-stwn/serupa-ds": minor
---

- `@diki-stwn/serupa-ds/testing` has testers for the widgets app tests drive most: `combobox()`, `menu()`, `tabs()`, `table()`, `calendar()` and `datePicker()`. Each takes the widget's element and `{ user }` (user-event's `userEvent.setup()`, or Vitest's browser `userEvent`), and does what a person does: `await combobox(field, { user }).choose('Canada')`, `await menu(button, { user }).choose(['Share', 'Email'])`, `await table(el, { user }).sort('Amount', 'descending')`, `await datePicker(field, { user }).pick('2026-12-24')`. They find parts by role and name, never by a `dk-` class, and wait for the widget to settle, so your tests don't break when the markup changes. See Guides › Testing your app.
