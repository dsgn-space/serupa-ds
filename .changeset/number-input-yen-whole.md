---
"serupa-ds": patch
---

Fixed (NumberInput): with minorUnits and a currency that has no minor digits (JPY, KRW), a typed fraction now reaches onValueChange and the form rounded to a whole unit, as the field shows it: 2.50 is ¥3 and 3, not 2.5.
