---
"serupa-ds": patch
---

TagGroup: with `max`, removing the last tag shown moves focus to the next tag, which takes its place, instead of back to the one before. A removed tag is no longer kept as picked, so `onSelectedChange` reports only tags that are still there.
