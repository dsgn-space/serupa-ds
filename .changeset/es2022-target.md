---
"serupa-ds": patch
---

- Changed: The JavaScript (`dist/index.js`, `serupa.iife.js` and the plain-page React files) is built for ES2022 instead of ES2019, so optional chaining, `??` and class fields ship as written instead of rewritten. Every browser the README supports (current Chrome, Edge, Safari and Firefox), and every browser React 19 runs in, has ES2022, so nothing changes for visitors. The files are slightly smaller.
