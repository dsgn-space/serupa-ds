---
"serupa-ds": minor
---

Tokens: success, warning and info now have the full status set danger already had: `success-hover`, `on-success`, `success-subtle-hover` and `success-border`, and the same for warning and info, in all six themes and the light-dark axes, with Tailwind utilities (`bg-success-hover`, `text-on-warning`, `border-info-border`…). Nothing that ships changes look; the new pairs (text on each fill and its hover, and each status text on its hover tint) are in the contrast matrix and checked in every theme. `on-success` and `on-warning` are dark text (green-950, amber-950), as the fills are too light for white; `on-info` is white in light themes.
