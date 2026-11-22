---
"serupa-ds": patch
---

Fixed (Themes): the fuchsia brand's hover and pressed colors, and its more-contrast focus ring, were violet, so a fuchsia primary Button turned violet under the pointer. They now read the fuchsia ramp (700 and 800 in light, 300 and 200 in dark), and a theme test checks that each brand's own aliases stay in its own hue. Visited links keep their violet on purpose.
