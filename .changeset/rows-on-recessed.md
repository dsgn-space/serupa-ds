---
"serupa-ds": patch
---

List and InlineEdit rows on a filled Card or a `bg-surface-muted` panel show their hover and selected fill again in light themes. There `surface-hover` matched the panel, so rows step up to `surface-raised` (white in light) instead. Any other Card or `bg-surface` inside gives its rows the usual fill. Card has two new tokens for this: `--card-row-bg-hover` and `--card-row-bg-hover-filled`.
