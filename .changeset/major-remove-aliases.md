---
"serupa-ds": major
---

- Removed: `dist/bundle.js` and the `serupa-ds/bundle.js` export, the old name of the browser script. Load `dist/serupa.iife.js` (`serupa-ds/serupa.iife.js`) instead; it is the same file.
- Removed: the `.justify-baseline` utility. `justify-content: baseline` does nothing in flex or grid layouts, so no page changes; delete the class where it's used, or use `items-baseline` to line items up on their text.
