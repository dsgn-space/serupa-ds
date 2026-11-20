---
"@diki-stwn/serupa-ds": major
---

The names deprecated for 17.0.0 are removed.

- **What breaks:** `TimelineItem`'s `status` prop and the `TimelineStatus` type, `Combobox`'s `onInputChange`, and `PasswordInput`'s `visible`, `defaultVisible` and `onVisibleChange`. Each has warned in development since it was deprecated, naming its replacement.
- **Why:** one idea, one name. `tone` is what every component calls a color's meaning, `onInputValueChange` is named for `inputValue` as every `on…Change` is named for its prop, and `revealed` is what MaskedValue calls showing a hidden value.
- **Migration:** `serupa-migrate` makes each rename: `status` → `tone`, `TimelineStatus` → `TimelineTone`, `onInputChange` → `onInputValueChange`, `visible` → `revealed`, `defaultVisible` → `defaultRevealed`, `onVisibleChange` → `onRevealedChange`.
