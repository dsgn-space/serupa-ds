---
"serupa-ds": patch
---

- Added: Tests: the foundation audit checks that every width in a media query (the component CSS, the utilities and `matchMedia()` in the components) is a `screen-*` value; a `max-width` may end just below one (`767.98px`). CSS variables don't work inside `@media`, so these values are written out and now can't drift from the tokens.
- Added: Tests: the brand list comes from `tokens.json` (`color.themes`). The foundation audit checks that `theme.js` (`BRANDS`, its default and its header), the `ThemeBrand` type and the theme lists in the tests name the same brands and themes, and that each brand has a light and a dark theme (ADR-0003).
- Changed: Docs: Storybook's Brand toolbar reads the brands from `tokens.json` instead of its own list. It shows the same three brands.
