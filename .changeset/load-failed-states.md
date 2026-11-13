---
"serupa-ds": minor
---

Activity feed, Stats row, Dashboard, List with search, List and detail, and Notifications: a failed-load state. With `loadFailed`, a "Couldn’t load" message and Try again stand in for the data. Screen readers hear it once, and Try again calls `onRetry`. Stats row's words are in `labels.loadFailed`, and Activity feed's in `loadFailedText`.
