---
"serupa-ds": patch
---

- Fixed: Dialog, Drawer: opening one no longer shifts the page behind it 15px sideways with classic scrollbars (Windows, Linux, and macOS set to always show them). While scrolling is locked, a page that had a scrollbar keeps its space (`scrollbar-gutter: stable`); a page without one gets none.
