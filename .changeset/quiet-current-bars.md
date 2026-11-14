---
'serupa-ds': patch
---

Sidebar, List, TreeView, Table rows and Navbar: the bar that marks the current or selected item is no longer blue. It takes `highlight-indicator`, the token Select's list and menus already use, so it shows only where more contrast is asked for and the fill marks the item otherwise. Each component's own token (`--sidebar-item-indicator`, `--list-indicator-selected`, `--tree-view-item-indicator`, `--table-row-indicator-selected`, `--navbar-link-indicator`) still sets it. A new lint rule, `serupa/no-accent-on-current`, keeps the accent off selected and current states unless the token is on its list.
