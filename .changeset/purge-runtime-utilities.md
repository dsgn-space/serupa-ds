---
"serupa-ds": patch
---

serupa-purge no longer keeps every block's and pattern's utility classes in a project's CSS. The build counted the classes in `src/blocks/` and `src/patterns/` as ones the components put on elements themselves, so `components.json` listed about 125 classes under `runtimeUtilities` and every purged stylesheet carried them. Now it lists only what the components use (22 classes, such as `sr-only`). A project that copied a block or pattern keeps its classes, since they're in the project's own files. The sign-in starter page drops from 33.0 to 32.1 KiB gzipped.
