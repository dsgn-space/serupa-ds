---
"serupa-ds": minor
---

- Added: `serupa-purge --components` also drops the styles of components your code never names, keeping the components they need (IconButton brings Button and Icon). An app that only uses Button gets about 48 KB of CSS instead of 189 KB. The map it reads ships as `serupa-ds/components.json`.
- Fixed: serupa-purge keeps `sr-only` and the other utility classes the components add at run time; it used to drop them, which made the screen-reader announcer visible.
