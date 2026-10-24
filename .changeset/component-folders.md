---
"serupa-ds": patch
---

- Changed: each component's words now come from its own folder (`src/components/<Name>/labels.ts`), and the package's export list, CSS imports and label sets are built from the component folders. `SerupaLabels`, `enLabels`, `idLabels`, `window.Serupa` and the CSS order are unchanged, and projects that import only some components still don't ship the Indonesian words.
