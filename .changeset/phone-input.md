---
"serupa-ds": minor
---

- Added: `PhoneInput`, a phone number field with a country menu. It groups the number the way the country writes it as people type, drops a typed trunk `0`, picks the country from a pasted `+…` number, and reports E.164 through `onValueChange` (with `complete` for the length check). `name` submits E.164. 51 countries, named in the locale's words.
- Added: `formatPhone` and `parsePhone`, for showing and reading E.164 numbers outside the field.
- Added: the `country` label ("Country" / "Negara").
