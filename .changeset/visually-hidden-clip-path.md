---
"serupa-ds": patch
---

- Fixed: VisuallyHidden, the FileUpload input and Sidebar's hidden label hide with `clip-path: inset(var(--sizing-1-2))` (50%) instead of the deprecated `clip`, as the `sr-only` class already did. Nothing changes on screen or for screen readers.
