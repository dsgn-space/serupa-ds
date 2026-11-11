---
"serupa-ds": patch
---

base.css: pseudo-elements (::before and ::after) now use border-box sizing too, as the stylesheet always said. The old selector put them inside :where(), where a pseudo-element can't match, so only elements got it. Stylelint 18 found it.

serupa-create: the starter app installs the React, Vite, TypeScript, ESLint and Stylelint versions this release was tested with, read from the release's own package.json, so they move with every dependency update (Stylelint 18, ESLint 10.14 and @types/node 26.6.6 in this one).
