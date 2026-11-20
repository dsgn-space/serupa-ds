---
"serupa-ds": patch
---

Dividers and separators show on raised and top-layer surfaces in dark.

Menu, Popover, Dialog, Drawer, HoverCard, Tour, Toast, the Select, Combobox, MentionInput, DatePicker, TimePicker, PeriodPicker and CascadeSelect pickers, TableOfContents' panel, Navbar's menu, what's inside an elevated Card, and the `bg-surface-raised` and `bg-surface-overlay` utilities now set `--border` to `border-overlay` for what's inside them, as they already set `--field` to `field-raised`. In dark, `border` (zinc-800) is those surfaces' own color, so a Menu's separator, a Drawer footer's top line, CascadeSelect's column lines and any Divider or bordered row in a Popover or Dialog vanished; they now take the surface's edge color (zinc-600). Light themes don't change: both are zinc-200.

Each component reads it through its own token (`--menu-divider`, `--dialog-divider`, `--card-divider-elevated` and so on), so it can be set back per component.
