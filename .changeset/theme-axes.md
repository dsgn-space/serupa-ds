---
"serupa-ds": minor
---

Dark mode without JavaScript: `data-brand` and `data-mode` now work on their own, on `<html>` or any element (ADR-0011). Every color that differs between themes is also written as a `light-dark()` pair, and `data-mode` sets `color-scheme` (`auto` is `light dark`), so `<html data-brand="violet" data-mode="auto">` follows the operating system from the first paint with no `theme.js`, a `data-mode="dark"` section works inside a light page, and a `data-brand` section takes its own brand. Badge's tone colors follow too. `data-theme` and `theme.js` work exactly as before, and a page with neither attribute stays light.
