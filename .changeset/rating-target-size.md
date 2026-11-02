---
"serupa-ds": patch
---

Rating: every star is a target at least 24px from the next, centre to centre (WCAG 2.2 target size, 2.5.8). At `sm` the gap between stars opens from 2px to 4px, and md or lg stars shrinking to fit a narrow box stop at 22px instead of 20px. A press between two stars now picks the nearer one instead of nothing. With `allowHalf`, a press anywhere on a star picks the half or the whole by where it lands, instead of each half being its own 12px target; the keys and screen readers still reach every half (GR104).
