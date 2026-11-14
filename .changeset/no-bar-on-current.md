---
'serupa-ds': patch
---

Sidebar, List, TreeView, Table rows and Navbar: the bar on the current or selected item is no longer drawn at all unless more contrast is asked for. It had been recolored to the highlight grey, which hides it only on the plain highlight fill: on a hovered current item, and on the Navbar's and List's own fills, it showed as a darker lip or side edge. A new token, `highlight-indicator-width`, is 0 by default and 2px with more contrast (`data-contrast="more"` or the system setting), and these bars take their width from it. `--list-indicator-width` and `--table-indicator-width` still set it.
