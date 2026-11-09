---
"serupa-ds": patch
---

- Fixed (SaveStatus): a project that imports SaveStatus no longer loads all of Loader for its saving ring, about 1.1 KiB gzipped less (9.0 to 7.9 KiB imported alone). The ring is the same markup and looks the same.
