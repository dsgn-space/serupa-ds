---
"serupa-ds": minor
---

Two more theme axes (ADR-0011). `data-contrast="more"` gives 7:1 text, including muted text and placeholders, and stronger borders and field outlines in every theme; it also applies when the system asks for more contrast (`prefers-contrast: more`) unless the page sets `data-contrast="normal"`. `data-density="compact"` makes `md` controls 28px and `lg` 36px (`sm` stays 24px); `data-density="comfortable"` restores the defaults for a section. In `tokens.json`, seven alias colors gain a `contrastMore` pair and the three `control-height` tokens a `compact` value; no token is renamed or removed. `tokens.css` now also sets `color-scheme` for `data-theme`, as `base.css` already did.
