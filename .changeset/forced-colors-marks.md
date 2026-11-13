---
"serupa-ds": patch
---

In forced colors (high contrast), the selected, active and current marks follow one recipe. The option the keyboard is on in Combobox, CommandPalette, TimePicker and MentionInput gets a focus-width outline drawn inside the option, so the list no longer clips its sides. Selected rows in CascadeSelect and TreeView get the 2px inside outline List already had. BottomNav and TableOfContents mark the current place with a 2px CanvasText outline, as Navbar, Sidebar and Pagination do. Outlines everywhere are sized by the outline-width tokens, and Tour's `--tour-ring-width` now defaults to `outline-width-2` (still 2px).
