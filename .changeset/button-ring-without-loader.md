---
"serupa-ds": patch
---

- Fixed (Button): a project that imports Button no longer loads all of Loader for its loading ring, about 1 KiB gzipped less (6.2 to 5.2 KiB imported alone). The ring is the same markup and looks the same.
- Fixed: `serupa-purge --components` counts the classes a component draws through a shared piece (Button's ring, Textarea's affixes), so it keeps Loader's styles for Button and Input's affix styles for Textarea.
