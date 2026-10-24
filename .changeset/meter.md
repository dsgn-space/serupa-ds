---
"serupa-ds": minor
---

- Added: Meter, a measurement within a known range (storage used, a strength, a battery level) with `role="meter"`. `low`, `high` and `optimum` color it by zone as HTML's `<meter>` does: success in the best zone, warning in the next, danger in the worst. It has `min`, `max`, `size`, `label`, `showValue` and `formatValue`, and the value follows the locale. `meterState()` returns the same zone for text that goes with it. Fourteen `--meter-*` tokens for its colors, sizes, spacing and motion.
