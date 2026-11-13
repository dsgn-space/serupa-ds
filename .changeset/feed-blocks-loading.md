---
"serupa-ds": minor
---

Activity feed and Comment thread: a `loading` state while the first comments or events load. Skeleton rows stand in for the list under the heading, the list says it's busy, and only one row is named for screen readers ("Loading: Activity" and "Loading comments" by default: Activity feed's `loadingLabel`, Comment thread's `labels.loading`). `loadingCount` sets how many rows show. The Comment thread's reply box is there from the start.
