---
"serupa-ds": patch
---

- Changed: Loader: the default label is "Loading…", with an ellipsis, like Combobox's loading row. The text variant shows it, and screen readers hear the same word. In `idLabels` it's "Memuat…".
- Changed: Button: screen readers hear "Loading…" when a button starts loading, the same words as Loader. `loadingText` still sets your own.
- Changed: Badge: screen readers hear "Loading…" when a badge starts loading, the same words as Loader. `loadingText` still sets your own.
