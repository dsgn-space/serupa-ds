---
"serupa-ds": patch
---

Changed: the shipped CSS is compacted. The build drops the spaces and line breaks around `{ } ; : , >`, which takes about 4.4 KiB gzipped off `bundle.css` (178.0 → 173.6), 2.1 KiB off `components.css`, 2.4 KiB off `utilities.css` and 1.1 KiB off `utilities-extra.css`. Only whitespace changes: every rule, selector and value is the same, a custom property keeps its value exactly as written, and each rule still starts its own line, so the CSS stays readable in devtools.
