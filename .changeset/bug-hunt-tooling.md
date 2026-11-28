---
"@diki-stwn/serupa-ds": patch
---

Fixes in the scripts and files that ship beside the components, from a bug hunt:

- **theme.js**: a page's own `data-theme` with a brand of yours that has a digit in its name (`b2b-dark`) is kept instead of turning into `blue-light`, and `onChange` hears a change of mode that keeps the same colors (light to auto on a light system) when the switch crossfades too.
- **serupa-purge** keeps a rule whose attribute selector holds a dot (`a[href$='.pdf']`), a `/*` inside a string (`content: "/* … */"`), and an `@import` whose address holds braces.
- **serupa-migrate** leaves a prop value that is part of an expression (`{'left' === dir ? …}`) as it is, and a comment between props with an apostrophe in it (`// don't`) no longer stops it renaming the props after it.
- **design-tokens/**: font stacks have one family per entry (`"Times New Roman"` was split wrongly), the `icon-size-*` tokens are references to the spacing they use instead of CSS values, and the type styles with letter spacing in em keep it instead of 0.
- **dist/vscode/serupa.css-data.json** offers every token, the spacing, radius and type ones and the escaped names like `--spacing-0\.5` too, not only the colors.
