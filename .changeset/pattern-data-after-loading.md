---
"@diki-stwn/serupa-ds": patch
---

The data an app passes once loading ends now shows. Saved items, Address book, Download your data, Expense report, Invoice, Leave request, Order status, Profile and Role permissions kept the data they had on their first render. So an app that rendered them with `loading` and an empty list, or with no data yet, went on showing that empty list or the demo after the real data arrived.
