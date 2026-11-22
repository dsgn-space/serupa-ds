---
"@diki-stwn/serupa-ds": major
---

Dark themes fill success, warning and info, and Badge's palette solids, with the light theme's shade, as they already do the brand (`primary`) and danger. A success Badge, a warning Meter and an info Toast's icon are the same color in light and dark.

- Changed: in dark themes `success` is `green-600` (was `green-500`), `success-hover` `green-500` (was `green-400`), `warning` `amber-600` (was `amber-500`) and `warning-hover` `amber-500` (was `amber-400`), with the same dark text on them as in light. `info` is #1e77b0 and `info-hover` #1d6693 (were `sky-400` and `sky-300`): the light theme's `sky-700` and `sky-800`, lightened only as far as 3:1 on a raised dark card asks, and `on-info` is white (was `sky-950`). More contrast keeps its own shades. The `*-text`, `*-subtle` and `*-border` tokens are unchanged.
- Changed: Badge's palette solids (`tone="violet" variant="solid"` and the other 17 families) are the light theme's step, 600 or 700 under white text, in dark themes too (they were 400 under 950 text). Hover and press darken them, as in light.
- Changed: Alert's info icon (`--alert-icon-info`) and EventCalendar's info bar (`--event-calendar-info-tone`) read `info-text`, the same `sky-700` in light and `sky-300` in dark, so each stays 3:1 on its tint.
- Changed: the contrast pair for `info` on the page is 3:1, what an icon or fill needs (WCAG 1.4.11); info text uses `info-text`.

- **What breaks:** text set from `--info` on a dark page is 3.6:1, under the 4.5:1 text needs; `--success` and `--warning` are a step darker in dark. Code that put dark text on `--info` in dark gets 2.9:1: use `--on-info`. A custom mark on a dark tint drawn with `--info` may fall under 3:1.
- **Why:** a dark theme's status fills were a palette step or two lighter than the light theme's, with info's text flipped from white to dark, so a status read as another color after dark. 18.0.0 makes the brand fill the light theme's in dark (ADR-0026); the status fills follow the same rule.
- **Migration:** text in a status color uses `--success-text`, `--warning-text` or `--info-text`, and text on a fill uses `--on-success`, `--on-warning` or `--on-info` (by hand). A page that wants the old dark shades sets them in its theme: `[data-theme$="-dark"] { --success: var(--green-500); --info: var(--sky-400); --on-info: var(--sky-950); }`.
