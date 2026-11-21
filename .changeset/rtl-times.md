---
"@diki-stwn/serupa-ds": patch
---

TimePicker and EventCalendar carry their `locale`'s direction on their times, so English given its own `locale` keeps its order in a right-to-left page: "3:45 PM" and "9:00 AM" no longer read "PM 3:45" and "AM 9:00", and Egyptian Arabic in a left-to-right page reads right to left. TimePicker's field and list, and EventCalendar's event times, hour labels and heading, take it; EventCalendar's grid stays in the page's direction.
