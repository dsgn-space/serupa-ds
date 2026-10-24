---
"serupa-ds": minor
---

- Added: Image: `priority`, for the main picture at the top of a page. It loads at once with `fetchpriority="high"` instead of lazily. Images now default to `decoding="async"`.
- Fixed: Image: with `ratio="auto"`, `width` and `height` now shape the frame before the picture arrives, so the page no longer jumps when it loads. Without them, Image warns once in the console.
