---
"serupa-ds": minor
---

Added OfflineBanner: put one in the app's layout and it says "You're offline" when the connection drops and "Back online" when it comes back, in a bar at the bottom or top of the screen (or inline) and once each to screen readers. It follows the browser, or your own `online` when your requests know better; children add what still works, and `onChange` runs on each change.
