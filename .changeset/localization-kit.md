---
"@diki-stwn/serupa-ds": minor
---

Localization: one `locale` switches the built-in words with the dates, numbers and direction, a pseudo-locale checks layouts before any translation exists, and a guide to writing copy that translates.

- **`SerupaProvider` `languages`:** give it the language packs your app offers (`languages={[en, id, ar]}`, each `import * as id from "@diki-stwn/serupa-ds/labels/id"`) and its `locale` picks the words from them: the pack for the whole tag, else for its language, so `id-ID` takes `id`. `labels` still wins over the pack, and a nested provider that sets only `locale` picks from the outer one's packs. Nothing changes for a provider without `languages`.
- **`localeDir(locale)`:** `"rtl"` or `"ltr"` for a locale, to set `dir` beside `lang` from the same setting.
- **`@diki-stwn/serupa-ds/labels/pseudo`:** every built-in word accented, about 40% longer and between ⟦ ⟧, with `pseudo(text)` and `pseudoLabels(set)` for an app's own words. It shows text that clips or won't fit a longer language, and any word left in plain English. Storybook's Language toolbar has it too.
- **Docs:** Localization adds one locale for everything, gender and other differences, the pseudo-locale, writing copy that translates and adding a language. Content and voice puts Indonesian beside every English example and adds tables for buttons, errors, empty states, confirmations and the tone for each moment.
