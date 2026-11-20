---
"serupa-ds": patch
---

Edges that went missing, and docs pages that said things twice.

- **Button (outline), dark themes:** the border now uses `border-overlay`. In dark themes the outline fill (`surface-raised`) and `border` were the same zinc-800, so the edge vanished; attached ButtonGroup, SplitButton and ToggleGroup segments lost the line between them. Light themes don't change (`border-overlay` is zinc-200 there, like `border`).
- **Toolbar:** a 1px `border` edge round its surface (new token `--toolbar-border`). Its `surface` fill is the page's white in light themes, so it only read as a bar in dark. The corners stay concentric with the controls (now 11px).
- **Accordion:** a disabled item's chevron fades with its title.
- **Docs:** foundation pages no longer print their title twice (Typography, Spacing, Motion and seven more); token names in the token tables stay on one line; the Elevation page names `surface-page` as the page. **Site:** a component page shows its "Added in" line once; a Beta or Alpha badge on an index card no longer narrows the card's summary; the home title is set at `tracking-tight`, like Heading's largest sizes.
