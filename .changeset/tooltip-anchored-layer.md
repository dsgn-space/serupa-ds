---
"serupa-ds": patch
---

- Changed: Tooltip places itself with the shared anchored-layer helper, like Popover and Menu. Nothing changes for people using it.
- Tooltip's tests moved next to it, into `Tooltip.test.tsx` (Vitest), with a new check that new text while open is placed again.
