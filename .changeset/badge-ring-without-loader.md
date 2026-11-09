---
"serupa-ds": patch
---

- Fixed (Badge): a project that imports Badge no longer loads all of Loader for its loading ring, about 1 KiB gzipped less (6.9 to 5.8 KiB imported alone). The ring is the same markup and looks the same.
