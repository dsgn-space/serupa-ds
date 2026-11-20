---
"serupa-ds": patch
---

PriceEstimate and LeaveRequest: two on one page keep their own choice. Their radio groups had fixed names, and radios that share a name outside a form are one group, so the second one's choice took the check from the first (which then showed no plan beside an estimate for one). Each names its group with `useId` now.

ProductPage: with two on one page, Add to cart with a choice missing focuses the first radio of the missing group in its own form. It looked the radio up across the whole document, so the second page's button moved focus into the first.

EmailPreferences, ListSearch and OrderHistory: with two on one page, focus after "Turn them back on", "Clear filters" and Show more lands on the page that was used. Each looked up its target across the whole document, so the second page's action moved focus into the first.
