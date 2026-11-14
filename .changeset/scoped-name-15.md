---
"@diki-stwn/serupa-ds": major
---

- **Breaking.** The package is `@diki-stwn/serupa-ds` (it was serupa-ds), and each release is also published to GitHub Packages, never to the public npm registry. Install it as before from the GitHub tag (`npm install github:dsgn-space/serupa-ds#v15.0.0`), or from GitHub Packages with two `.npmrc` lines and a token that can read packages (the README's Getting started). Every import and stylesheet path takes the new name: `import { Button } from '@diki-stwn/serupa-ds'`, `@diki-stwn/serupa-ds/bundle.css`. **Migration:** `npx serupa-migrate src --write` rewrites the old name in imports, CSS imports and `node_modules/` or CDN paths; then the dependency in your `package.json` takes the new name (the install line does it).
