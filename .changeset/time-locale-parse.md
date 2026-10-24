---
"serupa-ds": patch
---

- Fixed: TimePicker couldn't read the times it writes in some locales. In Korean ("오후 2:05"), Egyptian Arabic ("٢:٠٥ م") and Persian ("۱۴:۰۵"), a typed time, or a blur on the time the field had just written, was rejected and the field put back the last value. It now reads digits in any script and the locale's own words for AM and PM.
