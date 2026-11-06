---
"serupa-ds": minor
---

Added (OfflineBanner): `onOnlineChange(online)`, named like every other callback (`value` and `onValueChange`, `open` and `onOpenChange`). OfflineBanner is beta.

Deprecated (OfflineBanner): `onChange`. It still works, and is called as `onOnlineChange` is when `onOnlineChange` isn't given. It is removed in 15.0.0: rename `onChange` to `onOnlineChange`.
