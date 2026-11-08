---
"serupa-ds": patch
---

Calendar: a server-rendered page now marks the visitor's today, not the server's, and hydrates with no mismatch when the two dates differ (a UTC server and a visitor in Jakarta before 7am). Before, the server's day kept the today ring and "current date", and a Calendar with no value made React throw the server HTML away.
