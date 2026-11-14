---
"serupa-ds": minor
---

Dark mode: the page now sits a step below the cards and controls on it. A new token, `surface-page`, is the `<html>` and `<body>` background and a themed section's (white in light; zinc-950 in dark, as emerald's page already was), while cards, panels and bars stay on `surface` (zinc-900 in blue and violet). A second new token, `surface-control` (zinc-50 in light, zinc-900 in dark), fills controls that are their own surface: SegmentedControl's track and FileUpload's drop zone used the recessed `surface-muted` and so looked sunk into the page. SegmentedControl's selected segment now takes `field` (zinc-800 in dark), a step above its track. Light themes don't change. If you set `--segmented-control-bg`, `--segmented-control-indicator` or `--file-upload-zone-bg`, they still win. A page that paints its own background with `bg-surface` keeps zinc-900; use `bg-surface-page` for the new page fill.
