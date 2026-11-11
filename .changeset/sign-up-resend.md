---
"serupa-ds": minor
---

SignUp: the code step has "Send a new code", which its wrong-code error already pointed to. It calls the new `onResend(email)`, is busy until that settles, and says in a status region that the code went or that it couldn't. A second wrong or short code is said again to screen readers, though the words under the field don't change.
