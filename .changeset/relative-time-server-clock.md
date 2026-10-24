---
"serupa-ds": patch
---

- Fixed: RelativeTime rendered on a long-running server wrote the time the server started for every request ("5 minutes ago" hours later). Each request now uses the current time, kept the same for every RelativeTime rendered within the same second (K1).
