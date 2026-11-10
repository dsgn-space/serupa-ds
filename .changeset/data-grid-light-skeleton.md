---
"serupa-ds": patch
---

DataGrid: its loading placeholders use the same light skeleton as Table and List, so DataGrid no longer carries the whole Loader (about 1 KiB less). The placeholders are decorative and the loading label is said once, after the loader's delay, as before.
