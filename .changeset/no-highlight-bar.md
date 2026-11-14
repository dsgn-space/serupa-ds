---
"serupa-ds": minor
---

The highlighted item in a dropdown list (Combobox, Menu, TimePicker, MentionInput and CommandPalette) is marked by its grey fill alone: the blue bar at its start is gone, and a destructive Menu item loses its red one. With more contrast (`data-contrast="more"` or the system setting) a `text`-dark bar comes back, 3:1+ on the fill, and forced colors still outline the item. The new shared token `--highlight-indicator` sets the bar: the same color as `--highlight` by default, so to bring the old blue bar back set `--highlight-indicator: var(--primary)`.

In the light themes `--highlight`, the fill of the highlighted item in a list (Menu, Combobox, Select, TimePicker, MentionInput, CommandPalette, the Sidebar's current page), is lighter: zinc-100 instead of zinc-200.
