---
"serupa-ds": patch
---

base.css: a word too long for its line breaks instead of widening the page. Before, only bare links wrapped, so a long URL, ID or compound word in an app's own paragraph, card body or popover made the page scroll sideways on a phone (WCAG 1.4.10). `body` now sets `overflow-wrap: break-word`, which only breaks a word that would otherwise overflow and doesn't change how tables and flex items size.
