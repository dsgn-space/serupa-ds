---
"serupa-ds": minor
---

- Added: elevation tokens `surface-raised`, `surface-overlay`, `border-raised` and `border-overlay`. In light themes they match `surface` (and `border` for the overlay edge). In dark themes the surfaces step up to zinc-900 and the edges to zinc-800 and zinc-700, because a shadow doesn't show on zinc-950.
- Fixed: an `elevated` Card is visible in dark themes. Before, its border was transparent and its shadow black on black, so its text floated on the page. New tokens `--card-bg-elevated` and `--card-border-elevated`. `--card-bg` now sets only the outline card's background; set `--card-bg-elevated` for elevated cards.
- Changed: Menu, Popover, Dialog, Drawer, Toast and the Combobox, DatePicker and TimePicker lists use `surface-overlay`, and the ones with a border use `border-overlay`, so in dark themes they stand off the page.
