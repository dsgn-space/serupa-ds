---
"serupa-ds": patch
---

Button, Badge and SidebarItem watch whether their label is cut (to show it in full as a title) through one shared ResizeObserver and one font listener, instead of one of each per component, so a page with hundreds of them does far less work. Labels still gain and lose their title as they're cut and fit again.
