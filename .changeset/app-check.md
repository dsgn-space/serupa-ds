---
"serupa-ds": minor
---

New apps get a "done" they can check. `serupa-create` now adds `npm run check`: the types, then ESLint with jsx-a11y and `serupa-ds/eslint` (an Image with no `alt` fails), then Stylelint with `serupa-ds/stylelint` (a raw color, spacing or radius fails). The agent skill gets a short "Before you finish" section that says to run it and fix until it passes, Tab through the page once, and look at it in dark mode. `serupa-ds/eslint` no longer reads SkipLink as a plain link, so `<SkipLink />` with no text or `href` passes, as it should.
