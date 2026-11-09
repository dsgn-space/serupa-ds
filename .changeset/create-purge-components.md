---
"serupa-ds": patch
---

Changed: an app made with `serupa-create` now trims the styles of components it doesn't use (`serupaPurge({ components: true })`), so the starter ships 148 KB of CSS (23.5 KB gzipped) instead of 431 KB (61 KB). The README's sizes for the purge are updated.
