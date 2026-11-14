---
"serupa-ds": patch
---

Calendar, RangeCalendar, EventCalendar and StatusTracker no longer draw every day again when nothing they show has changed. A parent that renders again with the same props now costs them about a millisecond, down from 3 to 7. Pointing along a StatusTracker's strip now redraws only the caption, not all 90 bars and their names.
