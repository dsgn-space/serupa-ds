---
"serupa-ds": patch
---

Delay tokens: `delay-50` is listed before `delay-75` (it sat after it in every token table and file), and each delay says what waits that long instead of repeating its name. `delay-300` and `delay-500` both claimed to be the tooltip's wait, which is 400ms and kept in JavaScript; they now name the loading indicator's wait and HoverCard's. A new test keeps every numbered scale in the token source in order.
