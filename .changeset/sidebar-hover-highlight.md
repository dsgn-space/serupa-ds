---
"@diki-stwn/serupa-ds": patch
---

Sidebar: an item under the pointer is shaded with `highlight` (`zinc-100` in light themes, `zinc-700` in dark), the current page's fill, instead of `surface-hover` (`zinc-50` and `zinc-800`), which barely showed on a white sidebar. Only the current page draws the bar, with more contrast. `--sidebar-item-bg-hover` sets it as before.
