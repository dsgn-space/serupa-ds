---
"serupa-ds": minor
---

- Added: NumberInput `currency`, an ISO 4217 code that shows the amount as money with the symbol where the locale puts it ("$19.99", "19,99 €"), short for `formatOptions={{ style: "currency", currency }}`.
- Added: NumberInput `minorUnits`: with `currency`, `value`, `defaultValue`, `onValueChange`, `min`, `max` and `step` are whole minor units from ISO 4217 (1999 is $19.99, 0 decimals for JPY, 3 for KWD), so money can be stored as integers.
- Fixed: NumberInput with a currency format keeps the currency's decimals with a whole-number step: 12.5 stays $12.50 instead of rounding to $13.00.
