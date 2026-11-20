---
"@diki-stwn/serupa-ds": patch
---

RelativeTime, Countdown and FormattedNumber carry their `locale`'s direction (`dir`) with its `lang`, so English given its own `locale` keeps its order in a right-to-left page: "3 minutes ago", "4 minutes, 59 seconds" and "50 km/h" no longer read "minutes ago 3", "minutes, 59 seconds 4" or "km/h 50".
