---
"serupa-ds": patch
---

Button, Badge and SidebarItem: a label that gets cut after a web font loads or the font changes now shows its title, too. Before, only a change in the label's size was noticed. Badge and SidebarItem inside a Tooltip no longer add a title of their own as well, because the Tooltip already shows the cut label. This now matches Button.
