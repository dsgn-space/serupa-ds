---
"serupa-ds": patch
---

- Tooling: ESLint is upgraded from 9 to 10 (with `@eslint/js` 10 and `eslint-plugin-react-hooks` 7), so `npm ci` no longer warns that `eslint@9` is unsupported. Lint reports the same results as before; nothing in the published package changes.
