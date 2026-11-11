---
"serupa-ds": minor
---

- Added (FormattedNumber): `animate`. When the value changes, only the characters that changed fade in out of a slight blur over `motion-change-sm`, lined up from the end so "9,500" to "10,500" marks "10". The text stays one inline word for screen readers, the server and first render are plain text as before, and reduced motion changes it at once.
