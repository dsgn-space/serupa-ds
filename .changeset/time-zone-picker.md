---
"serupa-ds": minor
---

Added TimeZonePicker (beta): a Combobox of time zones by city, each with its offset now and its name in the reader's language ("UTC+07:00 · Western Indonesia Time"), the reader's own zone first. Typing finds a city, a zone name, an IANA name or an offset ("+7", "utc-5"), and the value is the IANA name. `timeZoneInfo()` and `allTimeZones()` give the same data for use elsewhere.
