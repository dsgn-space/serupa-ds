---
'@diki-stwn/serupa-ds': patch
---

In dark themes, the 2px ring that sets apart Avatar's status dot, the avatars in an AvatarGroup and Badge's indicator dot, and the gap around Chart's bars, slices and markers, are now drawn in the color behind them, instead of always `surface` (or `chart-gap`). On the page it no longer shows as a lighter halo. A new hook, `--surface-behind`, carries that color: base.css sets it to `surface-page` on the page, and each surface (Card, Menu, Popover, Dialog, Drawer, Table, List, Navbar, Sidebar and the other panels and bars) sets it to its own fill. Set it on a colored box of your own too. The ring tokens (`--avatar-ring`, `--avatar-group-ring`, `--badge-indicator-ring-color`) still win when you set them.
