---
"@diki/design-system": patch
---

- Fixed: `tokens.css` is now generated from `tokens.json` in the repository (`npm run tokens`, also run by `npm run build`) instead of by the frozen design system page, so token changes can pass CI again. The file's contents are unchanged.
