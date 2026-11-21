---
"@diki-stwn/serupa-ds": major
---

One rule for how urgent an announcement is: danger interrupts, everything else waits.

- **What changes:**
  - Alert with `tone="warning"` is `role="status"` now, not `role="alert"`, so a screen reader says it at the next pause instead of cutting in. Only `tone="danger"` is `role="alert"`, as a danger toast is the only toast said at once.
  - SaveStatus says its error at once (an assertive live region), not politely, so a failed save is as urgent as a danger toast about the same failure. "Saved" still waits its turn.
- **Migration:** nothing to rename, and nothing to do for most pages. A warning that must stop people before they act passes `role="alert"` itself: `<Alert tone="warning" role="alert">`.
