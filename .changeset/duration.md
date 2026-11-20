---
"@diki-stwn/serupa-ds": minor
---

Added: Duration (beta), how long something takes written the way the reader's locale writes it ("1 hr, 30 min", "1 jam, 30 menit", "1 hour, 30 minutes", "1h 30m" or "1:30:00"), as a `<time>` with an ISO 8601 `datetime`. A clock carries the long words for screen readers. `formatDuration` and `isoDuration` give the same text outside React.
