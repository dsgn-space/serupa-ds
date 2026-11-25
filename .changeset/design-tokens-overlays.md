---
"@diki-stwn/serupa-ds": major
---

`design-tokens/` keeps a theme as its mode and its brand's overlay, not 34 whole files.

- **What breaks:** `design-tokens/themes/<theme>.tokens.json` is gone. `themes/light.tokens.json` and `themes/dark.tokens.json` hold the alias colors (the default brand's), and `brands/<theme>.tokens.json` holds the aliases a brand sets apart from them. A tool that loaded one theme file by path (a Tokens Studio or Style Dictionary setup) loads the mode file, then the overlay.
- **Why:** the deep audit of 21 Nov 2026 found 34 whole files that differed in a handful of values each, 55% of `design-tokens/`. The folder goes from 2.4 MB to 1.3 MB, in the package and in every checkout.
- **Migration:** for `violet-dark`, load `serupa.tokens.json`, `themes/dark.tokens.json`, then `brands/violet-dark.tokens.json` (later files win). `tools/tokens/style-dictionary.config.mjs` shows it for Style Dictionary.
