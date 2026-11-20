---
"serupa-ds": patch
---

PriceEstimate and LeaveRequest: two on one page keep their own choice. Their radio groups had fixed names, and radios that share a name outside a form are one group, so the second one's choice took the check from the first (which then showed no plan beside an estimate for one). Each names its group with `useId` now.
