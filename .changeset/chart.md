---
'serupa-ds': minor
---

- **Added: Chart (beta, CH2).** A line or bar chart of up to eight series over the same categories, drawn as SVG at its box's width. The plot is a group with a summary a screen reader hears first (the kind, the series, each one's lowest and highest value); every point is one tab stop away, named with its series, category and value, with arrow keys along and across series (mirrored right to left), and its values in a tooltip. Each series has its own marker shape or bar pattern as well as its chart color, and "Show as table" shows the same numbers as a sortable Table. The line draws in and the bars grow once, unless motion is reduced. Missing values leave a gap; `formatValue` sets how a value is written everywhere.
