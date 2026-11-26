---
"@diki-stwn/serupa-ds": minor
---

Tokens: a tidy-up of tokens used for the wrong job. Nothing looks different except Progress's ring, in light themes.

- New token `border-elevated`: a line on the raised step (`surface-raised`), with the same values as `border-overlay` (zinc-200 in light, zinc-600 in dark). The outline Button's border (`--button-outline-border`) and the dividers inside an elevated Card (`--card-divider-elevated`) now use it. They read `border-overlay` before, the top layer's edge, though neither a button nor a card is in the top layer. A project that set `--border-overlay` to restyle outline buttons or elevated cards sets `--border-elevated` now.
- Progress: the circle's empty part is the shared `track` gray, like the bar's (`--progress-ring-track`). It used `secondary`, the button fill. It is one step darker in light (zinc-200, was zinc-100), and the same zinc-700 in dark.
- Deprecated: `border-control-pressed`. Nothing in Serupa reads it since Switch's off track took `track-pressed`. It keeps working, and is removed in 20.0.0. For a pressed control edge of your own, use `border-control-hover` or set the color yourself.
- The token descriptions say where `border-control-hover` is used (Carousel's dots, no longer Switch's track) and where the dark #333338 of `surface-hover-raised` and `field-raised` comes from: zinc-800 and zinc-700 mixed half and half, between two palette steps rather than a new one.
