---
"serupa-ds": minor
---

Account security pattern: deleting the account can wait. With `deleteAfter`, the delete is scheduled for that many days later: the dialog says the day, and a banner at the top of the page says it again with Keep my account (`onKeepAccount`) until then. `deletionDate` opens the page with a delete already asked for, and `plan` says that a paid plan stops renewing. `onDeleteAccount` gets the scheduled day.
