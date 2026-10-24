---
"serupa-ds": patch
---

- Fixed: Slider and NumberInput landed off the grid when `min` had decimals that `step` didn't. With `min={0.5}` and `step={1}`, Slider showed a default of 2.5 as 3, and NumberInput's ArrowUp went from 2.5 to 4. Values now keep the decimals of both `min` and `step`, so they stay on 0.5, 1.5, 2.5 and so on. A step written in exponent form (`1e-7`) no longer rounds every value to a whole number.
