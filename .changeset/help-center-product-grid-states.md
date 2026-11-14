---
"serupa-ds": minor
---

The Product grid block has loading and failed-load states. Set `loading` to show placeholder cards, which are announced once as "Loading products". Set `loadFailed` with `onRetry` to show "Couldn’t load the products" with Try again. The Help center pattern can open on any step of its form: `initial` fills in the answers, `failed` says what's missing or that the last send failed, and `start="sent"` shows the sent message.
