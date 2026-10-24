---
"serupa-ds": minor
---

- Fixed: the focus ring on Button (and IconButton, Fab), Checkbox, Radio, Switch and clickable Badges painted its 2px gap in `surface`. On a tinted background it showed as a band: white on light Alerts, black on dark ones, and the same on muted Navbar, Sidebar and Card backgrounds. These components now use the recipe every other component uses, an outline with `outline-offset`. Its gap is transparent and it follows the corner radius.
- Added: `focus-ring-width` (2px) and `focus-ring-offset` (2px) tokens, used by every component's focus ring and by the base `:focus-visible` style.
- Deprecated: `--button-focus-gap-color`, `--checkbox-focus-gap-color`, `--radio-focus-gap-color`, `--switch-focus-gap-color` and `--badge-focus-gap-color`. They have no effect now and are removed in 9.0.0.
- A contract check fails on a box-shadow focus ring in component CSS. Inset rings are allowed where an outline would be clipped (Tabs).
