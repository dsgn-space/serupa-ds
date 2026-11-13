---
"serupa-ds": patch
---

The Dashboard pattern writes its storage amounts ("8.6 GB of 10 GB") in the nearest SerupaProvider's locale, as it does its days, instead of the browser's. A page rendered on the server now hydrates without a mismatch when the visitor's browser uses another language.
