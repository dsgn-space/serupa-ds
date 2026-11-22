---
"@diki-stwn/serupa-ds": minor
---

Added: Chart `type="heatmap"`, a grid with a row per series and a column per category, each cell shaded by its value. `scale="sequential"` (the default) uses five steps of the sequential chart ramp, from the lowest value to the highest; `scale="diverging"` uses seven steps of the diverging ramp, neutral around `midpoint` (0 by default), red below and blue above. Each cell is named with its row, column and value, the arrow keys move between cells, the tooltip and the table show the numbers, and the legend shows the scale. A heatmap takes up to 64 rows, 32px a row unless `height` is set. New component tokens `--chart-cell-seq-1` to `5` and `--chart-cell-div-1` to `7` override the shades.
