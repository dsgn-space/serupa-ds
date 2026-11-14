---
"serupa-ds": minor
---

Form fields stand out on raised and floating surfaces in dark. A new `field-raised` token (white in light, `#333338` in dark) is the field fill inside a Dialog, Drawer, Popover, an elevated Card and `bg-surface-raised` or `bg-surface-overlay` panels, which set `--field` to it; before, a field there was the same `zinc-800` as the surface and looked flat. Each of those components has a token to change it (`--dialog-field-bg`, `--drawer-field-bg`, `--popover-field-bg`, `--card-field-bg-elevated`). If you set `--field` on the page, set `--field-raised` too for fields in overlays.
