---
"@diki-stwn/serupa-ds": minor
---

Switch: off, the track is the light `track` gray in place of `border-control`, and the thumb is white in every theme (light and dark, on or off) with the small `elevation-part` shadow and no edge, as Apple's. The pending ring and the check on it keep 3:1 (a dark theme's `on-primary`). On the light track the off switch, and in dark themes the white thumb on the on track, are under 3:1, a design choice. New tokens `--switch-thumb-shadow` and `--switch-thumb-ink-dark`; `--switch-thumb` and `--switch-thumb-checked` now default to `white`; `--switch-track` now defaults to `track`, `--switch-track-hover` to `border-strong` and `--switch-track-pressed` to `border-control`.
