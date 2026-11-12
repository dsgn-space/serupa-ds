---
"serupa-ds": minor
---

- Added: tactile motion for the violet brand. A held button sinks 1px and a link card settles back by the same amount, a Switch thumb crosses on a soft spring that still lands within about 100ms, a Checkbox tick draws itself on when ticked under the pointer or keyboard focus, and pressed controls spring back with the softer `ease-spring-soft`. Reduced motion turns all of it off. Blue and emerald move exactly as before.
- Added: tokens `depth-press`, `motion-toggle`, `motion-draw` and `ease-toggle` (flat by default, with tactile values), and the component token `--checkbox-draw-duration`. Button and Card read `depth-press` directly, so set it on one to change how far it sinks.
- Changed (all brands, dark mode): `surface-muted` is now zinc-950, a step darker than the page, instead of zinc-800. Recessed panels, sidebars, table headers and filled Cards now read as recessed in dark mode as they do in light, and filled and elevated Cards no longer look alike. Pages that put muted text on `surface-muted` keep AA contrast.
