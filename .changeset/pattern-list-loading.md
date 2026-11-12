---
"serupa-ds": minor
---

List with search and filters, List and detail, and Notifications: a `loading` state. Screen readers hear "Loading projects", "Loading messages" or "Loading notifications" once. The list keeps its place with placeholder rows and says it's busy, and the pages and Mark all as read wait. Notifications now also keep each item's own `read` when the items arrive after the first render; until now every one that came later showed as unread.
