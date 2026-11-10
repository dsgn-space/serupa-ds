---
"serupa-ds": minor
---

TableActionBar: the `tableSelected` label gets the count formatted for the locale as a second argument, `(count, formatted)`, and the default uses it. The bar now shows "٢ selected" in ar-EG and "1,200 selected" in English, where it showed "2 selected" and "1200 selected". Labels that take only the count keep working.
