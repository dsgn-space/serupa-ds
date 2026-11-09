---
"serupa-ds": minor
---

Added: BottomNav and BottomNavLink, a phone bottom navigation bar. A `<nav>` named by `label` with three to five links, each an icon over a short label, the current one with `aria-current="page"`; `as` takes your router's link. It pads itself with the safe-area insets, leaves room at the end of the page and in `scroll-padding-bottom`, and hides from 768px up by default (`hideFrom`: `'sm'`, `'md'`, `'lg'` or `false`). While it shows, a bottom Toaster, OfflineBanner and Fab sit above it.
