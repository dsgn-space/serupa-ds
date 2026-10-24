---
"serupa-ds": patch
---

- Fixed: SegmentedControl: in `size="sm"`, icon-only segments were 18px wide with their centers 18px apart, which fails WCAG 2.2's target size minimum (2.5.8). They're now at least 24px wide. The control is still 24px tall, and md segments don't change.
