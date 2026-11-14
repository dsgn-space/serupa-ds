---
"@diki-stwn/serupa-ds": minor
---

An item under the pointer no longer looks like the current one. With the bar gone, Sidebar, Navbar and TreeView gave a hovered item the same fill as the current or selected item. Their hover fill is now `surface-hover`, one step quieter than `highlight` (in a Navbar menu panel, `surface-hover-raised` through a new token, `--navbar-menu-link-bg-hover`; `--navbar-link-bg-hover` no longer reaches the panel's links). In emerald dark, `surface-hover` is `zinc-900` and `surface-hover-raised` is `#202023`, so the same one step holds there: its row hover and stripes are a step quieter too.
