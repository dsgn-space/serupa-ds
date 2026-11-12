---
"serupa-ds": minor
---

Steps and opened items now move in a direction. A panel with `view-transition-class: step` slides in from the end when a View Transition of type `forward` runs (`withViewTransition(update, { types: ['forward'] })`) and from the start for `back`, mirrored right to left, with a crossfade under reduced motion (the rules are in `base.css`). The DataImport pattern uses it between its steps. On a phone, the ListDetail pattern opens a message in place: it comes forward while its subject travels from its row into the heading, and Back plays it the other way. The Motion foundation's "Layout changes" says how to do both in your own screens.
