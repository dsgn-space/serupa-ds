---
"serupa-ds": patch
---

EventCalendar writes an event's time with the hour unpadded in every browser ("9.30" in Indonesian), as the server writes it. Firefox padded the hour for some 24-hour locales ("09.30"), so a server-rendered calendar didn't match when it hydrated there.
