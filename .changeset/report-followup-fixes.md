---
"@diki-stwn/serupa-ds": patch
---

- Badge with `max={0}` uses the lowest max, 1 ("1+"), rather than the default 99.
- Invoice's sums are whole cents: three at 0.10 is 0.30, and `onPay` gets the total shown, not 0.30000000000000004.
- SessionTimeout stays signed out when "Stay signed in" or activity is answered only after the session ran out, since `onExpire` was already called.
