---
"@diki-stwn/serupa-ds": patch
---

- Fixed (Button): Dark-theme hover and pressed states darken custom `--btn-bg` colors just like light themes instead of lightening toward low-contrast white text.
- Fixed (Chart): Data table view spans the full chart grid width, and axis tick rounding preserves precision for large values.
- Fixed (ErrorSummary): Added `role="region"` so `aria-labelledby` is attached to a valid landmark role.
- Fixed (Accordion): Only set `aria-labelledby` on panels that carry `role="region"` (open panels when the group has six or fewer items).
- Fixed (Form): Catch synchronous throws and rejected promises from `onSubmit` and async field validators, showing the error alert and clearing `submitting`.
- Fixed (Slider): Ignore Enter key presses during IME composition so confirming a character does not commit the slider value early.
- Fixed (RelativeTime): Preserve signed zero for past timestamps (`"0 seconds ago"`) and avoid overshooting calendar months across short months such as February.
- Fixed (Duration): Treat `Infinity` and `-Infinity` as empty values instead of rendering `∞:NaN:NaN` or `PInfinityD`.
- Fixed (FileUpload): Return an empty string from `formatFileSize` for `Infinity`, `-Infinity`, `NaN`, and negative byte counts.
- Fixed (NumberInput): Guard `snap`, `step`, and `largeStep` against non-finite or non-positive values so stepping never produces `NaN`.
- Fixed (Avatar): Skip common honorifics and suffixes when computing initials when other words remain.
- Fixed (Table): Keep full opacity on idle sort icons so they maintain 3:1 non-text contrast against table headers.
- Fixed (Labels): Honor locale-formatted values in `ratingStars` and `ratingValue` across all translated label packs, and use full Arabic CLDR plural forms for `chatThoughtFor` and `statusSummary`.
- Fixed (Tokens): Order `InterVariable` `@font-face` rules with the `latin` subset last so browsers fetch only the needed subset.
- Fixed (Debug): Compare unrounded WCAG contrast ratios and floor the reported ratio to two decimals so values just below 4.5:1 are flagged as failing.
