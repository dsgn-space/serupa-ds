---
"serupa-ds": patch
---

- Changed: `components.css`, `utilities.css`, `bundle.css` and `base.css` ship without the source comments, which made up about 40% of `components.css`: it drops from 43.8 to 27.3 KiB gzipped, and `bundle.css` from 208 to 193 KiB. The rules are the same and keep their layout; the commented source stays in `src/`.
