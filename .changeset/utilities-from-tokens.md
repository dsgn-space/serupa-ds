---
"serupa-ds": patch
---

- Changed: the utility classes are generated from the tokens. `src/styles/utilities.template.css` (347 KB, 5,900 lines) replaces the 1.8 MB hand-kept `utilities.css`; its `@each` loops repeat each color, spacing and other token-scaled class once per token, and `@responsive` makes the `sm:` … `2xl:` variants from the `screen-*` tokens. A new token now gets its classes without editing the CSS. `dist/utilities.css` has the same 25,560 classes with the same declarations, one rule per line.
- Changed: the color tokens `field`, `field-border`, `field-border-hover`, `placeholder` and `overlay` sit after `surface-muted` in `tokens.json`, the order the utility classes already had. No token changed name or value.
