---
"serupa-ds": minor
---

AuthCard: `onResend` can return a promise, and "Send a new code" is busy until it settles; a rejection says the code didn't go (new `resendFailed` label). The code step has "Back to email and password" (new `back` label), which keeps the email and puts focus on the heading. A second wrong or short code is said again to screen readers, though the words under the field don't change.
