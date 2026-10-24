---
"serupa-ds": patch
---

- Changed: `font-mono` is the system's monospace font (`ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`) instead of Courier New, which was thin, wide and hard to tell 0 from O in. The token keeps its name.
- Changed: with `base.css`, a bare `<kbd>` uses `font-sans`, like the `<Kbd>` component. `code`, `samp` and `pre` keep `font-mono`.
