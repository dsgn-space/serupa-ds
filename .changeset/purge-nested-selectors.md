---
"serupa-ds": patch
---

Fixed: `serupa-purge --components` and `serupaPurge({ components: true })` no longer write invalid CSS for an app that uses Button without ButtonGroup. A selector list with nested parentheses, such as ButtonGroup's `:is(.dk-btn--primary, .dk-btn--primary + :not(.dk-btn))`, used to be split inside the parentheses, and Vite's CSS minifier rejected the result. It is now split only at its top-level commas.
