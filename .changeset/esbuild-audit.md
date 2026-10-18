---
"serupa-ds": patch
---

- Security: tsup and Storybook now build with esbuild 0.28.2, which clears the one low `npm audit` warning (a file read through esbuild's dev server on Windows, GHSA-g7r4-m6w7-qqqr). Vite keeps its own esbuild 0.25, which the warning never covered. The ES module build is byte-for-byte the same; `serupa.iife.js` and `bundle.js` differ only in esbuild's small CommonJS wrapper helper.
