---
"serupa-ds": patch
---

Sidebar and Navbar: the current page now has a 2px bar in the primary color (at an item's start in Sidebar and in Navbar's menu panels, along the bottom of a Navbar link) that hover never draws, so a hovered item no longer looks exactly like the current page. The current page also darkens one step under the pointer, where hovering it used to change nothing. New tokens: `--sidebar-item-indicator`, `--sidebar-item-bg-active-hover`, `--navbar-link-indicator` and `--navbar-link-bg-active-hover`.
