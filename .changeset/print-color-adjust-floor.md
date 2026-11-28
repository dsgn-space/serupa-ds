---
"@diki-stwn/serupa-ds": patch
---

Watermark and Chart print their colors in Chrome and Edge 129 to 135 too: they now set `-webkit-print-color-adjust` beside `print-color-adjust`, so the mark and the chart's fills stay on paper with background graphics off.
