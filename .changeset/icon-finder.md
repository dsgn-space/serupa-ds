---
"serupa-ds": major
---

- Every Material Symbol (all 3,776) now works by name: `<Icon name="category" />`, `leftIcon="category"`. Names autocomplete in TypeScript through the new `MaterialIconName` type. Imported icons (`icon={Category}`) still work.
- **Breaking.** Removed: the `CommonIconName` type and the "everyday icons" list (`docs/icon-names.json`). Every name works now, so there's nothing to pick from. Migration: use `IconName` or `MaterialIconName` instead of `CommonIconName`.
- Size: the package's main entry now carries every icon, about 520 KB more gzipped.
- `serupa-icons.iife.js` is no longer needed on plain pages; it's kept, empty, so pages that include it keep working.
- Docs: every icon control in Storybook (Button, Badge, Input, Select, EmptyState, Icon) is a list of every icon name instead of a text box, and the Foundations/Icons page shows all of them with search; a click copies the name. The icon test now checks every icon against the 5.x font, not only the everyday ones.
