---
"serupa-ds": patch
---

NumberInput with `formatOptions={{ style: 'percent' }}` and no `step`: tabbing through the field no longer turns 15% into 0%, typing 15 gives 0.15 instead of 0, and ArrowUp moves one percent instead of jumping to 100%. A percent keeps the decimals its format shows (12.5% with `maximumFractionDigits: 1` is 0.125).
