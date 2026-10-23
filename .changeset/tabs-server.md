---
"serupa-ds": patch
---

Tabs without `defaultValue` now pick their first enabled tab while rendering, so server-rendered HTML already has a selected tab, a visible panel and a tab that can be reached with the keyboard. Before this fix every panel was hidden until JavaScript ran, and then the content jumped in. Every tab now always points at its panel with `aria-controls`.
