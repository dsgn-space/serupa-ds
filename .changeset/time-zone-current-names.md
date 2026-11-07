---
"serupa-ds": patch
---

Fixed (TimeZonePicker): a value under a zone's current name, such as "Europe/Kyiv", "Asia/Kolkata", "Asia/Ho_Chi_Minh" or "America/Nuuk", left the field empty in Chrome, because Chrome still lists the older spellings (Kiev, Calcutta, Saigon, Godthab).

- The list and `timeZoneInfo()` now use the current names, and a value under either spelling shows. What the picker hands back is the current name.
- Typing the old name still finds the zone. Common abbreviations and big cities that share a zone ("pst", "ist", "wib", "mumbai", "beijing", "nyc") find it too.
