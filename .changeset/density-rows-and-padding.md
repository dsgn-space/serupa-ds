---
"@diki-stwn/serupa-ds": minor
---

Compact density reaches rows and padding, not only control heights. Under `data-density="compact"`, table and list rows take 6px of padding instead of 12px, small tables, DataGrid cells and Sidebar items 4px instead of 8px, Card 12px instead of 20px, Accordion and Popover 12px instead of 16px, and Dialog, Drawer and large cards 16px instead of 24px. Nothing changes at the default density.

- **New tokens:** `space-card`, `space-row` and `space-item`, spacing roles the components read, like `space-surface`. `space-content` and `space-surface` now have compact values too.
- **Changed:** `--table-padding-y`, `--table-padding-y-sm`, `--list-padding-y`, `--data-grid-padding-y`, `--sidebar-item-padding-y`, `--accordion-padding-y` and `--card-padding-md` default to those roles instead of a fixed step. Their default values are the same; a project that sets one of them keeps its own value at every density.
- **To keep the old compact look,** put `data-density="comfortable"` on the region, or set the component token.
