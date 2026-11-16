---
"@diki-stwn/serupa-ds": minor
---

Added: one name for each idea across components, so learning one teaches the rest. The old names keep working, with a development warning (`deprecated-prop`), until 17.0.0.

- TimelineItem takes `tone`, the name every component gives what a color means, and exports its type as `TimelineTone`. Deprecated: `status` and the `TimelineStatus` type; use `tone` and `TimelineTone`.
- Combobox (and TimeZonePicker) takes `onInputValueChange`, named for `inputValue` as every on…Change callback is named for its prop. Deprecated: `onInputChange`; use `onInputValueChange`.
- PasswordInput takes `revealed`, `defaultRevealed` and `onRevealedChange`, the names MaskedValue gives showing a hidden value. Deprecated: `visible`, `defaultVisible` and `onVisibleChange`; use `revealed`, `defaultRevealed` and `onRevealedChange`.
- MaskedValue takes `defaultRevealed`, to show the whole value at first, as every controlled state has a default.
