---
"serupa-ds": patch
---

Slider never lands on a `max` that's off its step grid, as a native range input doesn't: with min 0, max 10 and step 3, End, a step up and a value of 10 all stop at 9. Before, the thumb could reach 10, a value no step leads to.
