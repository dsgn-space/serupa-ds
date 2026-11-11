---
"serupa-ds": minor
---

Combobox: the `resultsCount` label gets the count formatted for the locale as a second argument, `(count, formatted)`, and the default uses it. The count said once typing stops now reads "٢ results" in ar-EG and "1,200 results" in English, where it said "2 results" and "1200 results". Labels that take only the count keep working.
