---
"serupa-ds": patch
---

- Fixed: a `<section data-mode="dark">` stayed light unless `<html>` had `data-brand` or `data-mode`, which included every page that uses `data-theme`. Its `color-scheme` turned dark, so native controls and scrollbars went dark on a white background. A nested `data-mode` element now carries the full set of light-dark() colors, keeps the brand of the page or section around it (or takes its own `data-brand`), and keeps `data-contrast="more"` from the page.
