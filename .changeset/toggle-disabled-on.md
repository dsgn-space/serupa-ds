---
"@diki-stwn/serupa-ds": minor
---

ToggleButton and ToggleGroup: a toggle that is on and disabled no longer keeps its full primary colors, which made it look like the one live button in a disabled group. It is drawn in neutrals now: the highlight fill, muted text and, for outline, the control border. Three new tokens set them: `--toggle-button-bg-pressed-disabled`, `--toggle-button-text-pressed-disabled` and `--toggle-button-border-pressed-disabled`.
