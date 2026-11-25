---
"@diki-stwn/serupa-ds": major
---

The package ships Inter split by script only.

- **What breaks:** `fonts/InterVariable.woff2` and `fonts/InterVariable-Italic.woff2` (the whole fonts, 740 KB) are gone from the package. `tokens.css` never loaded them: it loads the files split by script (`fonts/InterVariable-latin.woff2` and the rest), with a `unicode-range` each, so a page that uses `tokens.css` sees no change. A page that linked a whole font itself links the split files, or takes `--font-sans` from `tokens.css`.
- **Why:** the deep audit of 21 Nov 2026 found the whole fonts shipped beside the split ones that every page loads.
- **Migration:** replace a link to `fonts/InterVariable.woff2` with `tokens.css`'s faces (`import '@diki-stwn/serupa-ds/tokens.css'`), or with `fonts/InterVariable-latin.woff2` and the other scripts your text uses.
