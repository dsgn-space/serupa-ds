---
"serupa-ds": minor
---

FilterBar: the `filterResults` label gets the count formatted for the locale as a second argument, `(count, formatted)`, and the default uses it. The results count now reads "1,320 results" in English and in Arabic-Indic digits in ar-EG, where it said "1320 results". Labels that take only the count keep working.
