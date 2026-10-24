---
"serupa-ds": minor
---

- Added: RelativeTime, a `<time datetime>` that says how long ago or how far ahead a moment is, in the locale's words ("3 minutes ago", "yesterday", "in 2 hours"), with the exact date as its tooltip. Every RelativeTime on a page updates on one shared 15-second clock, and server-rendered ones hydrate without a mismatch. It has `format`, `numeric`, `titleFormat` and `locale`, and `relativeTime(date, now, locale)` gives the same words outside React.
