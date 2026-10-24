---
"serupa-ds": minor
---

- Added: type roles, text styles named for what they're for: `type-display`, `type-heading-1` to `type-heading-4`, `type-title`, `type-body`, `type-body-sm`, `type-label`, `type-caption`, `type-overline` and `type-code`. Each is a class in `tokens.css`, a `--text-type-*` font shorthand, and a typography token in `design-tokens/`. `<Heading>` levels 1 to 4 render the heading roles exactly, so a class and the component match. `type-display` has a line height of 1.1, so two-line headlines don't touch. The `type-xs` to `type-9xl` size styles are unchanged.
