---
"serupa-ds": minor
---

- Added: chart colors, in every theme. `chart-1` to `chart-8` for the series, each 3:1 on the page and on a raised card, alternating darker and lighter so neighbours are 1.7:1 apart at least; `chart-seq-1` to `chart-seq-5`, a sequential ramp; `chart-div-1` to `chart-div-7`, a diverging one around `chart-div-4`; and `chart-grid`, `chart-axis`, `chart-label` and `chart-gap`, the page color drawn between bars and slices that touch, so each has 3:1 against it. In forced colors they take the user's colors. They make no utility classes: read them as variables (`fill: var(--chart-1)`). The Colors foundation shows them.
