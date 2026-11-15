---
"@diki-stwn/serupa-ds": minor
---

- Added: `serupa-create <folder> --template <page>` starts a new app on a whole page, such as `dashboard`, `settings-form`, `sign-in` or any other pattern `--template` alone lists. The pattern and the blocks it builds on go into `src/serupa/` as source the app owns, and `App.tsx` renders it.
- Fixed: the patterns and blocks `serupa-add` writes now pass the app's own `npm run check`. `@diki-stwn/serupa-ds/eslint` no longer reads BreadcrumbItem and ListItem as links, so a breadcrumb's current page and a list item with both `href` and `onClick` stop failing jsx-a11y. A new app's ESLint config allows `role="list"` on a list without bullets, which Safari's VoiceOver needs.
