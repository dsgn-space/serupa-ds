---
"serupa-ds": minor
---

- Added: a `highlight` color token (zinc-200 light, zinc-700 dark) for the highlighted row in a list.
- Changed: Menu, Combobox, TimePicker and Sidebar use `highlight` for the hovered, focused, active or current row, so they look the same. Before, Menu and Sidebar used `secondary` and Combobox and TimePicker used `surface-muted`.
- Changed: from the keyboard, the highlighted Menu item, Combobox option and TimePicker time also get a 2px primary bar at their start (a danger-colored bar on a destructive Menu item). New tokens: `--menu-item-indicator`, `--combobox-option-indicator`, `--time-picker-option-indicator`.
- Changed: on the highlighted Combobox option, the muted second line turns to `text`, which keeps 4.5:1 on `highlight`.
- Native Select options are drawn by the browser and can't use the token.
