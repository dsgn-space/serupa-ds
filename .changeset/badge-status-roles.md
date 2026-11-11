---
"serupa-ds": minor
---

Badge: the status tones (success, warning, danger, info) now follow the status roles instead of fixed palette steps, so a theme or page that sets `--success` or `--danger` moves its badges too. Subtle is `<status>-subtle` with `<status>-text`, solid is `<status>` with `on-<status>`, outline is `<status>-text` on a `<status>` border, and a clickable solid badge moves toward `<status>-hover` on hover and press. Each is a new `--badge-<status>-*` component token. In light themes this is a little lighter than before: a 50 tint instead of 100, and solid success and warning are green-600 and amber-600 with dark text instead of 700 with white. The green, amber, red and sky palette tones keep the old look for anyone who wants it.
